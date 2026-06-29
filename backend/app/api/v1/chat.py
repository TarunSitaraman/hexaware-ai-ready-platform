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


@router.post("")
async def chat(req: ChatRequest):
    # Simulate processing delay
    await asyncio.sleep(1.5)
    
    return {
        "id": f"msg-{uuid.uuid4().hex[:8]}",
        "role": "assistant",
        "content": f"Based on the data, the US GDP growth in 2024 was 2.4%, driven primarily by consumer spending and tech investments despite elevated interest rates of 5.25%. Inflation cooled slightly in the Eurozone but remained persistent globally.",
        "citations": [
            {
                "id": "chk-1",
                "text": "In 2024, United States GDP grew by 2.4%, driven by strong consumer spending and tech sector investments despite elevated interest rates of 5.25%.",
                "score": 0.92,
            },
            {
                "id": "chk-2",
                "text": "Eurozone inflation cooled to 2.8% in Q1 2024, allowing the ECB to consider initial rate cuts. However, German industrial output remained sluggish.",
                "score": 0.85,
            }
        ],
        "token_usage": {"prompt": 450, "completion": 65, "total": 515},
        "created_at": datetime.now().isoformat(),
    }