import os

from fastapi import FastAPI

from src.rag.router import router as rag_router

app = FastAPI(
    title="Bayanihan.AI - AI Engine",
    version="0.1.0",
    description="RAG pipeline and AI orchestration for Philippine legal research",
)

# No CORS middleware — this service is internal-only via Railway private networking.
# Only the API Gateway is publicly exposed and handles CORS.


@app.get("/health")
async def health():
    return {
        "success": True,
        "data": {
            "status": "healthy",
            "service": "ai-engine",
            "version": "0.1.0",
        },
    }


app.include_router(rag_router, prefix="/research")
