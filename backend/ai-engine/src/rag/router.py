from fastapi import APIRouter
from pydantic import BaseModel, Field

from src.rag.pipeline import legal_research

router = APIRouter()


class ResearchRequest(BaseModel):
    query: str = Field(min_length=3, max_length=2000)
    filters: dict | None = None


class CitationRef(BaseModel):
    type: str
    id: int
    identifier: str
    title: str
    date: str | None = None
    relevance_score: float
    excerpt: str | None = None


class ResearchResponse(BaseModel):
    answer: str
    citations: list[CitationRef]
    confidence_score: float
    disclaimer: str
    cached: bool
    latency_ms: int


@router.post("/", response_model=dict)
async def research(request: ResearchRequest):
    result = await legal_research(request.query, request.filters)
    return {"success": True, "data": result}
