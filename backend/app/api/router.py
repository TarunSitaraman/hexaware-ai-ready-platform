from fastapi import APIRouter
from app.api.v1.datasets import router as datasets_router
from app.api.v1.pipeline import router as pipeline_router
from app.api.v1.quality import router as quality_router
from app.api.v1.embeddings import router as embeddings_router
from app.api.v1.chat import router as chat_router
from app.api.v1.architecture import router as architecture_router

api_router = APIRouter()

api_router.include_router(datasets_router, prefix="/datasets", tags=["Datasets"])
api_router.include_router(pipeline_router, prefix="/pipeline", tags=["Pipeline"])
api_router.include_router(quality_router, prefix="/quality", tags=["Quality"])
api_router.include_router(embeddings_router, prefix="/embeddings", tags=["Embeddings"])
api_router.include_router(chat_router, prefix="/chat", tags=["Chat"])
api_router.include_router(architecture_router, prefix="/architecture", tags=["Architecture"])