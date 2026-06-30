from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uuid
import asyncio

router = APIRouter()


class ChatRequest(BaseModel):
    message: Optional[str] = None
    question: Optional[str] = None
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
    # Determine the query from either 'question' or 'message'
    query = req.question or req.message or "Hello"
    
    start_time = datetime.now()
    # Simulate processing delay for realistic UX
    await asyncio.sleep(1.2)
    
    # Generate dynamic answer based on actual CSV data
    rag_response = rag_service.generate_answer(query)
    
    latency = int((datetime.now() - start_time).total_seconds() * 1000)
    
    return {
        "id": f"msg-{uuid.uuid4().hex[:8]}",
        "role": "assistant",
        "content": rag_response["answer"],
        "answer": rag_response["answer"],
        "citations": rag_response["citations"],
        "context": [c["text"] for c in rag_response["citations"]],
        "token_usage": {
            "prompt_tokens": len(query) * 2, 
            "completion_tokens": len(rag_response["answer"]) * 2, 
            "total_tokens": (len(query) + len(rag_response["answer"])) * 2
        },
        "latency_ms": latency,
        "created_at": datetime.now().isoformat(),
    }