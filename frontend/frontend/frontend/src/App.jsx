import { useState, useRef } from "react";

const API_URL = "https://english-buddy-production.up.railway.app/";

const VOICES = [
  { value: "american_female", label: "🇺🇸 American Female" },
  { value: "american_male", label: "🇺🇸 American Male" },
  { value: "british_female", label: "🇬🇧 British Female" },
  { value: "indian_female", label: "🇮🇳 Indian Female" },
  { value: "australian_female", label: "🇦🇺 Australian Female" },
];

export default function App() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hello! I am your English Buddy 👋 Press the mic button and speak to me in English. I will reply and also correct your grammar!",
      correction: "",
    },
  ]);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState("american_female");
  const [conversationHistory, setConversationHistory] = useState([]);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    audioChunksRef.current = [];
    mediaRecorderRef.current.ondataavailable = (e) => {
      audioChunksRef.current.push(e.data);
    };
    mediaRecorderRef.current.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setIsRecording(false);
    setIsLoading(true);

    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");
      formData.append("conversation_history", JSON.stringify(conversationHistory));
      formData.append("voice", selectedVoice);

      try {
        const res = await fetch(`${API_URL}/conversation`, {
          method: "POST",
          body: formData,
        });
        const data = await res.json();

        setMessages((prev) => [
          ...prev,
          { role: "user", text: data.transcription, correction: "" },
          { role: "assistant", text: data.reply, correction: data.correction },
        ]);

        setConversationHistory((prev) => [
          ...prev,
          { role: "user", content: data.transcription },
          { role: "assistant", content: data.reply },
        ]);

        // Play audio
        const audioBytes = atob(data.audio_base64);
        const byteArray = new Uint8Array(audioBytes.length);
        for (let i = 0; i < audioBytes.length; i++) {
          byteArray[i] = audioBytes.charCodeAt(i);
        }
        const blob = new Blob([byteArray], { type: "audio/mpeg" });
        new Audio(URL.createObjectURL(blob)).play();

        scrollToBottom();
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: "Sorry, something went wrong. Please try again.",
            correction: "",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">

      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-700 text-white px-6 py-4 shadow-lg">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold tracking-tight">🎙️ English Buddy</h1>
          <p className="text-sm text-purple-200 mt-0.5">Your AI English conversation partner</p>
        </div>
      </div>

      {/* Voice Selector */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <span className="text-sm text-gray-500 font-medium">AI Voice:</span>
          <select
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
            disabled={isRecording || isLoading}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 cursor-pointer"
          >
            {VOICES.map((v) => (
              <option key={v.value} value={v.value}>{v.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto flex flex-col gap-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
            >
              {/* Avatar + Bubble */}
              <div className={`flex items-end gap-2 max-w-[80%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
                  msg.role === "user"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-gray-200 text-gray-600"
                }`}>
                  {msg.role === "user" ? "👤" : "🤖"}
                </div>

                {/* Bubble */}
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-gradient-to-br from-violet-600 to-purple-700 text-white rounded-br-sm"
                    : "bg-white text-gray-800 shadow-sm rounded-bl-sm"
                }`}>
                  {msg.text}
                </div>
              </div>

              {/* Correction Box */}
              {msg.correction && (
                <div className="mt-2 ml-10 max-w-[80%] bg-amber-50 border-l-4 border-amber-400 px-4 py-2.5 rounded-r-lg">
                  <p className="text-xs font-semibold text-amber-700 mb-0.5">✏️ Grammar Correction</p>
                  <p className="text-xs text-amber-800 leading-relaxed">{msg.correction}</p>
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {isLoading && (
            <div className="flex items-end gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm">🤖</div>
              <div className="bg-white shadow-sm px-4 py-3 rounded-2xl rounded-bl-sm">
                <div className="flex gap-1 items-center h-4">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:200ms]"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:400ms]"></span>
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white border-t border-gray-200 px-6 py-5">
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-3">

          {/* Mic Button */}
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isLoading}
            className={`flex items-center gap-2 px-8 py-4 rounded-full text-white font-semibold text-base transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
              isRecording
                ? "bg-red-500 hover:bg-red-600 animate-pulse shadow-red-200"
                : "bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 shadow-purple-200 hover:-translate-y-0.5"
            }`}
          >
            {isRecording ? (
              <><span className="text-lg">⏹</span> Stop & Send</>
            ) : (
              <><span className="text-lg">🎙️</span> Tap to Speak</>
            )}
          </button>

          {/* Status */}
          {isLoading && (
            <p className="text-sm text-gray-500 animate-pulse">⏳ Processing your voice...</p>
          )}
          {isRecording && (
            <p className="text-sm text-red-500 animate-pulse">🔴 Recording... speak clearly</p>
          )}
          {!isRecording && !isLoading && (
            <p className="text-xs text-gray-400">Tap the button and speak in English</p>
          )}

        </div>
      </div>

    </div>
  );
}
