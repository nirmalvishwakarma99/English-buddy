from groq import Groq
from app.config import settings

client = Groq(api_key=settings.GROQ_API_KEY)

def transcribe_audio(audio_file) -> str:
    transcription = client.audio.transcriptions.create(
        model="whisper-large-v3",
        file=audio_file,
        language="en"
    )
    return transcription.text