from typing import Dict

from fastapi import APIRouter
from pydantic import BaseModel, Field

from backend.app.services.json_repository import get_qa_data
from backend.app.services.qa_engine import match_chat


router = APIRouter(prefix="/qa", tags=["qa"])


class ChatRequest(BaseModel):
    text: str
    context: Dict[str, str] = Field(default_factory=dict)


@router.post("/chat")
def chat(payload: ChatRequest) -> dict:
    return match_chat(payload.text, payload.context, get_qa_data())
