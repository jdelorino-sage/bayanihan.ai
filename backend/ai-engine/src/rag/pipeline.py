import os
import time

import anthropic
import openai

from src.rag.prompts import LEGAL_SYSTEM_PROMPT, LEGAL_DISCLAIMER

# Initialize clients
anthropic_client = anthropic.AsyncAnthropic(api_key=os.getenv("ANTHROPIC_API_KEY", ""))
openai_client = openai.AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY", ""))


async def generate_embedding(text: str) -> list[float]:
    """Generate embedding vector using OpenAI text-embedding-3-small."""
    response = await openai_client.embeddings.create(
        model="text-embedding-3-small",
        input=text,
    )
    return response.data[0].embedding


async def vector_search(embedding: list[float], filters: dict | None = None) -> list[dict]:
    """Search Neon pgvector for similar legal documents."""
    # TODO: Connect to Neon PostgreSQL
    # query = """
    #     SELECT id, gr_number, title, date_decided, ponente, full_text,
    #            embedding <=> $1::vector AS distance
    #     FROM legal_corpus.cases
    #     ORDER BY embedding <=> $1::vector
    #     LIMIT 10
    # """
    return []


async def fulltext_search(query: str) -> list[dict]:
    """Supplement vector search with full-text search."""
    # TODO: Connect to Neon PostgreSQL
    # query_sql = """
    #     SELECT id, gr_number, title, ts_rank(tsvector_content, query) AS rank
    #     FROM legal_corpus.cases,
    #          plainto_tsquery('english', $1) query
    #     WHERE tsvector_content @@ query
    #     ORDER BY rank DESC
    #     LIMIT 5
    # """
    return []


def merge_results(vector_results: list[dict], fts_results: list[dict]) -> list[dict]:
    """Merge and deduplicate vector + full-text search results."""
    seen_ids: set[int] = set()
    merged: list[dict] = []

    for doc in vector_results + fts_results:
        if doc.get("id") not in seen_ids:
            seen_ids.add(doc["id"])
            merged.append(doc)

    return merged


async def generate_response(query: str, context: list[dict]) -> str:
    """Generate legal research response using Claude."""
    context_text = "\n\n".join(
        f"[{doc.get('gr_number', 'Unknown')}] {doc.get('title', '')}\n{doc.get('full_text', '')[:2000]}"
        for doc in context
    )

    if not context_text:
        context_text = "No relevant cases found in the database yet. The legal corpus is being populated."

    response = await anthropic_client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=4096,
        system=LEGAL_SYSTEM_PROMPT,
        messages=[
            {
                "role": "user",
                "content": f"Context from Philippine legal database:\n{context_text}\n\nLegal research question: {query}",
            }
        ],
    )

    return response.content[0].text


async def verify_citations(answer: str, context: list[dict]) -> list[dict]:
    """Verify that all citations in the answer exist in the database."""
    # TODO: Parse citations from answer and verify against database
    citations = []
    for doc in context:
        citations.append(
            {
                "type": "case",
                "id": doc.get("id", 0),
                "identifier": doc.get("gr_number", ""),
                "title": doc.get("title", ""),
                "date": doc.get("date_decided"),
                "relevance_score": 1.0 - doc.get("distance", 0.5),
                "excerpt": doc.get("full_text", "")[:200] if doc.get("full_text") else None,
            }
        )
    return citations


async def legal_research(query: str, filters: dict | None = None) -> dict:
    """Full RAG pipeline for legal research."""
    start_time = time.time()

    # 1. Generate query embedding
    embedding = await generate_embedding(query)

    # 2. Vector similarity search
    vector_results = await vector_search(embedding, filters)

    # 3. Full-text search supplement
    fts_results = await fulltext_search(query)

    # 4. Merge and deduplicate
    context = merge_results(vector_results, fts_results)

    # 5. Generate response via Claude
    answer = await generate_response(query, context)

    # 6. Verify citations
    citations = await verify_citations(answer, context)

    latency_ms = int((time.time() - start_time) * 1000)

    # 7. TODO: Cache in Redis

    return {
        "answer": answer,
        "citations": citations,
        "confidence_score": min(len(context) / 10, 1.0),
        "disclaimer": LEGAL_DISCLAIMER,
        "cached": False,
        "latency_ms": latency_ms,
    }
