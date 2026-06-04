from groq import Groq
from app.config import settings

client = Groq(api_key=settings.GROQ_API_KEY)

TUTOR_PROMPT = """
You are a friendly English conversation partner and tutor.
Your job is to:
1. Have a natural conversation with the user in English
2. Reply in a warm, encouraging tone
3. At the end of every reply, add a section called 'Correction' where you
   gently point out any grammar or vocabulary mistakes the user made.
   If there are no mistakes, say 'Great English! No corrections needed.'

Format your response exactly like this:
Reply: [your conversational reply here]
Correction: [grammar correction or 'No corrections needed']
"""

def get_ai_response(message: str, conversation_history: list) -> dict:
    messages = [{"role": "system", "content": TUTOR_PROMPT}]

    for msg in conversation_history:
        messages.append({
            "role": msg.role,
            "content": msg.content
        })

    messages.append({
        "role": "user",
        "content": message
    })

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages,
        max_tokens=1024
    )

    reply_text = response.choices[0].message.content

    reply = ""
    correction = ""

    if "Reply:" in reply_text and "Correction:" in reply_text:
        reply = reply_text.split("Correction:")[0].replace("Reply:", "").strip()
        correction = reply_text.split("Correction:")[1].strip()
    else:
        reply = reply_text

    return {
        "reply": reply,
        "correction": correction,
        "full_response": reply_text
    }