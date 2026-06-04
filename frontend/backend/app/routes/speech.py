from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.whisper_service import transcribe_audio

router = APIRouter()

@router.post("/speech-to-text")
async def speech_to_text(audio: UploadFile = File(...)):
    # Validate file type
    allowed_types = ["audio/wav", "audio/mpeg", "audio/mp4",
                     "audio/webm", "audio/ogg", "audio/flac", "video/webm" ]

    if audio.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type: {audio.content_type}. Allowed: {allowed_types}"
        )

    # Read audio bytes
    audio_bytes = await audio.read()

    # Create a tuple (filename, bytes, content_type) for Groq
    audio_file = (audio.filename, audio_bytes, audio.content_type)

    # Transcribe
    text = transcribe_audio(audio_file)

    return {
        "transcription": text,
        "message": "Audio transcribed successfully"
    }