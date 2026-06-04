# 🎙️ English Buddy

An AI-powered English conversation and tutoring app.
Speak in English → AI replies naturally → Corrects your grammar → Speaks back to you.

## 🚀 Live Demo
- Frontend: [your-app.vercel.app](https://your-app.vercel.app)
- Backend: [your-api.railway.app](https://your-api.railway.app)

## 📸 Screenshots
(add screenshots here after deployment)

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI (Python) |
| AI / LLM | Groq + Llama 3.3 70B |
| Speech-to-Text | Groq Whisper Large V3 |
| Text-to-Speech | Microsoft Edge TTS |
| Frontend | React + Vite + Tailwind CSS |
| Backend Hosting | Railway |
| Frontend Hosting | Vercel |

## ⚙️ How It Works
1. User speaks in English via microphone
2. Whisper AI transcribes voice to text
3. Llama 3.3 70B generates natural reply + grammar correction
4. Edge TTS converts reply to speech
5. User hears the reply and sees corrections

## 🏃 Run Locally

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🔑 Environment Variables