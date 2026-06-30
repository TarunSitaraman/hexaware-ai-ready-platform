from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uuid
import asyncio

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    dataset_id: Optional[str] = None
    session_id: Optional[str] = None


class Citation(BaseModel):
    id: str
    text: str
    score: float


from app.services.rag_service import HybridRAGService

rag_service = HybridRAGService()

@router.post("")
async def chat(req: ChatRequest):
    # Simulate processing delay for realistic UX
    await asyncio.sleep(1.5)
    
    # Generate dynamic answer based on actual CSV data
    rag_response = rag_service.generate_answer(req.message)
    
    return {
        "id": f"msg-{uuid.uuid4().hex[:8]}",
        "role": "assistant",
        "content": rag_response["answer"],
        "citations": rag_response["citations"],
        "token_usage": {"prompt": len(req.message) * 2, "completion": len(rag_response["answer"]) * 2, "total": (len(req.message) + len(rag_response["answer"])) * 2},
        "created_at": datetime.now().isoformat(),
    }