"""
Batch Embedding Script for Bayanihan.AI

Generates OpenAI embeddings for legal documents in Neon PostgreSQL
and updates the embedding column using pgvector.

Usage:
    python batch_embed.py --source sc-decisions --limit 1000
    python batch_embed.py --source statutes --limit 500
"""

import argparse
import asyncio
import logging
import os

import asyncpg
import openai

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DATABASE_URL = os.getenv("DATABASE_URL", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
EMBEDDING_MODEL = "text-embedding-3-small"
EMBEDDING_DIM = 1536
BATCH_SIZE = 100  # OpenAI allows up to 2048 inputs per request


async def get_unembedded_documents(
    conn: asyncpg.Connection, source: str, limit: int
) -> list[dict]:
    """Fetch documents that don't have embeddings yet."""
    if source == "sc-decisions":
        rows = await conn.fetch(
            """
            SELECT id, gr_number, title, full_text
            FROM legal_corpus.cases
            WHERE embedding IS NULL
            ORDER BY date_decided DESC
            LIMIT $1
            """,
            limit,
        )
    elif source == "statutes":
        rows = await conn.fetch(
            """
            SELECT id, type || ' ' || number AS identifier, title, full_text
            FROM legal_corpus.statutes
            WHERE embedding IS NULL
            ORDER BY date_enacted DESC NULLS LAST
            LIMIT $1
            """,
            limit,
        )
    elif source == "provisions":
        rows = await conn.fetch(
            """
            SELECT id, section_number AS identifier, '' AS title, text AS full_text
            FROM legal_corpus.provisions
            WHERE embedding IS NULL
            LIMIT $1
            """,
            limit,
        )
    else:
        logger.error(f"Unknown source: {source}")
        return []

    return [dict(row) for row in rows]


def prepare_text_for_embedding(doc: dict) -> str:
    """Prepare document text for embedding. Truncate to ~8000 tokens (~32000 chars)."""
    title = doc.get("title", "")
    full_text = doc.get("full_text", "")
    text = f"{title}\n\n{full_text}"
    return text[:32000]


async def generate_embeddings(texts: list[str]) -> list[list[float]]:
    """Generate embeddings for a batch of texts using OpenAI."""
    client = openai.AsyncOpenAI(api_key=OPENAI_API_KEY)

    response = await client.embeddings.create(
        model=EMBEDDING_MODEL,
        input=texts,
    )

    return [item.embedding for item in response.data]


async def update_embeddings(
    conn: asyncpg.Connection, source: str, updates: list[tuple[int, list[float]]]
) -> int:
    """Write embeddings back to the database."""
    table = {
        "sc-decisions": "legal_corpus.cases",
        "statutes": "legal_corpus.statutes",
        "provisions": "legal_corpus.provisions",
    }.get(source, "")

    if not table:
        return 0

    count = 0
    for doc_id, embedding in updates:
        embedding_str = "[" + ",".join(str(x) for x in embedding) + "]"
        await conn.execute(
            f"UPDATE {table} SET embedding = $1::vector WHERE id = $2",
            embedding_str,
            doc_id,
        )
        count += 1

    return count


async def main():
    parser = argparse.ArgumentParser(description="Batch embed legal documents")
    parser.add_argument(
        "--source",
        choices=["sc-decisions", "statutes", "provisions"],
        required=True,
        help="Document source to embed",
    )
    parser.add_argument(
        "--limit", type=int, default=1000, help="Max documents to process"
    )
    args = parser.parse_args()

    if not DATABASE_URL:
        logger.error("DATABASE_URL environment variable not set")
        return

    if not OPENAI_API_KEY:
        logger.error("OPENAI_API_KEY environment variable not set")
        return

    conn = await asyncpg.connect(DATABASE_URL)

    try:
        docs = await get_unembedded_documents(conn, args.source, args.limit)
        logger.info(f"Found {len(docs)} unembedded documents for {args.source}")

        if not docs:
            logger.info("No documents to embed")
            return

        total_embedded = 0

        for i in range(0, len(docs), BATCH_SIZE):
            batch = docs[i : i + BATCH_SIZE]
            texts = [prepare_text_for_embedding(doc) for doc in batch]

            logger.info(f"Embedding batch {i // BATCH_SIZE + 1} ({len(batch)} docs)...")
            embeddings = await generate_embeddings(texts)

            updates = [(doc["id"], emb) for doc, emb in zip(batch, embeddings)]
            count = await update_embeddings(conn, args.source, updates)
            total_embedded += count

            logger.info(f"  Embedded {count} documents")

        logger.info(f"Total: {total_embedded} documents embedded for {args.source}")

    finally:
        await conn.close()


if __name__ == "__main__":
    asyncio.run(main())
