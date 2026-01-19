"use client";

export default function BotonIA() {
  return (
    <button 
      onClick={() => window.dispatchEvent(new Event("open-chat"))}
      className="bg-white text-blue-600 px-4 py-2 rounded-lg font-bold text-sm shadow-lg hover:bg-gray-100 transition"
    >
      Hablar con IA 🤖
    </button>
  );
}