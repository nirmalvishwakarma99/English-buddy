from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from app.services.whisper_service import transcribe_audio
from app.services.gemini_service import get_ai_response
from app.services.tts_service import text_to_speech
from app.models.schemas import Message
import base64
import json

router = APIRouter()

AVAILABLE_VOICES = {
    "american_female": "en-US-JennyNeural",
    "american_male": "en-US-GuyNeural",
    "british_female": "en-GB-SoniaNeural",
    "indian_female": "en-IN-NeerjaNeural",
    "australian_female": "en-AU-NatashaNeural"
}

@router.post("/conversation")
async def full_conversation(
    audio: UploadFile = File(...),
    conversation_history: str = Form(default="[]"),
    voice: str = Form(default="american_female")
):
    # Step 1: Validate audio
    allowed_types = [
        "audio/wav", "audio/mpeg", "audio/mp4",
        "audio/webm", "audio/ogg", "audio/flac",
        "video/webm"
    ]
    if audio.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail=f"Invalid file type: {audio.content_type}")

    # Step 2: Transcribe audio to text
    audio_bytes = await audio.read()
    audio_file = (audio.filename, audio_bytes, audio.content_type)
    transcription = transcribe_audio(audio_file)

    if not transcription.strip():
        raise HTTPException(status_code=400, detail="Could not transcribe audio. Please speak clearly.")

    # Step 3: Parse conversation history
    try:
        history_data = json.loads(conversation_history)
        history = [Message(**msg) for msg in history_data]
    except Exception:
        history = []

    # Step 4: Get AI response
    ai_result = get_ai_response(transcription, history)

    # Step 5: Convert AI reply to speech (await since it is now async)
    voice_name = AVAILABLE_VOICES.get(voice, "en-US-JennyNeural")
    audio_response = await text_to_speech(ai_result["reply"], voice_name)

    # Step 6: Encode audio as base64
    audio_base64 = base64.b64encode(audio_response).decode("utf-8")

    # Step 7: Return everything
    return JSONResponse(content={
        "transcription": transcription,
        "reply": ai_result["reply"],
        "correction": ai_result["correction"],
        "audio_base64": audio_base64,
        "message": "Success"
    })