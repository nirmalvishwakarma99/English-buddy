from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
from app.services.tts_service import text_to_speech

router = APIRouter()

AVAILABLE_VOICES = {
    "american_female": "en-US-JennyNeural",
    "american_male": "en-US-GuyNeural",
    "british_female": "en-GB-SoniaNeural",
    "indian_female": "en-IN-NeerjaNeural",
    "australian_female": "en-AU-NatashaNeural"
}

class TTSRequest(BaseModel):
    text: str
    voice: str = "american_female"

@router.post("/text-to-speech")
async def tts(request: TTSRequest):
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    voice_name = AVAILABLE_VOICES.get(request.voice, "en-US-JennyNeural")
    audio_bytes = await text_to_speech(request.text, voice_name)

    return Response(
        content=audio_bytes,
        media_type="audio/mpeg",
        headers={"Content-Disposition": "inline; filename=reply.mp3"}
    )