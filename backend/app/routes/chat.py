from fastapi import APIRouter
from app.models.schemas import ChatRequest, ChatResponse
from app.services.gemini_service import get_ai_response

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    result = get_ai_response(request.message, request.conversation_history)
    return result