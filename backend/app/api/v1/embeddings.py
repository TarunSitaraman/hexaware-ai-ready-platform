from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import Optional

router = APIRouter()


@router.get("/{dataset_id}")
async def get_embedding_stats(dataset_id: str):
    return {
        "dataset_id": dataset_id,
        "total_chunks": 0,
        "embedding_model": "text-embedding-ada-002",
        "dimensions": 1536,
        "avg_tokens_per_chunk": 0,
    }


@router.get("/{dataset_id}/search")
async def search_embeddings(
    dataset_id: str,
    query: str = Query(...),
    top_k: int = Query(10, le=50),
):
    return {
        "query": query,
        "results": [],
        "total": 0,
    }