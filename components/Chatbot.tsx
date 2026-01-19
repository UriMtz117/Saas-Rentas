"use client";
import { useState, useEffect } from "react";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [chat, setChat] = useState<{ role: string, text: string }[]>([]);

  // Esto hace que el bot se abra cuando presionas el botón del Dashboard
  useEffect(() => {
    const handleOpenChat = () => setIsOpen(true);
    window.addEventListener("open-chat", handleOpenChat);
    return () => window.removeEventListener("open-chat", handleOpenChat);
  }, []);

  const enviarPregunta = async () => {
    if (!mensaje) return;
    const nuevoChat = [...chat, { role: "user", text: mensaje }];
    setChat(nuevoChat);
    setMensaje("");

    const res = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({ message: mensaje }),
    });
    const data = await res.json();
    setChat([...nuevoChat, { role: "assistant", text: data.reply }]);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <button onClick={() => setIsOpen(!isOpen)} className="bg-blue-600 text-white p-4 rounded-full shadow-2xl text-2xl hover:scale-110 transition">
        {isOpen ? "✖" : "🤖"}
      </button>

      {isOpen && (
        <div className="bg-white border shadow-2xl rounded-2xl w-80 h-96 mt-4 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
          <div className="bg-blue-600 p-4 text-white font-bold">Asistente IA</div>
          <div className="flex-1 p-4 overflow-y-auto text-sm space-y-2">
            {chat.map((c, i) => (
              <div key={i} className={`${c.role === 'user' ? 'text-right' : 'text-left'}`}>
                <span className={`inline-block p-2 rounded-lg ${c.role === 'user' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                  {c.text}
                </span>
              </div>
            ))}
          </div>
          <div className="p-4 border-t flex gap-2">
            <input value={mensaje} onChange={(e) => setMensaje(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && enviarPregunta()} placeholder="Escribe tu duda..." className="flex-1 border p-2 rounded-lg text-sm outline-none focus:border-blue-500" />
            <button onClick={enviarPregunta} className="bg-blue-600 text-white px-3 rounded-lg">↑</button>
          </div>
        </div>
      )}
    </div>
  );
}