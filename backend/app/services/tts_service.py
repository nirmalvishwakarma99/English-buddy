import edge_tts
import io

async def text_to_speech(text: str, voice: str = "en-US-JennyNeural") -> bytes:
    communicate = edge_tts.Communicate(text=text, voice=voice)
    
    audio_buffer = io.BytesIO()
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_buffer.write(chunk["data"])
    
    audio_buffer.seek(0)
    return audio_buffer.read()