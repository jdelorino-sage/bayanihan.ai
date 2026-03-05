from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.rag.router import router as rag_router

app = FastAPI(
    title="Bayanihan.AI - AI Engine",
    version="0.1.0",
    description="RAG pipeline and AI orchestration for Philippine legal research",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
