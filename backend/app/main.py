from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import chat, speech, tts, conversation
from app.config import settings

app = FastAPI(
    title=settings.APP_NAME,
    description="AI-powered English conversation and tutoring app",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router, prefix="/api/v1", tags=["Chat"])
app.include_router(speech.router, prefix="/api/v1", tags=["Speech"])
app.include_router(tts.router, prefix="/api/v1", tags=["TTS"])
app.include_router(conversation.router, prefix="/api/v1", tags=["Conversation"])

@app.get("/")
def home():
    return {"message": f"{settings.APP_NAME} backend is running!"}