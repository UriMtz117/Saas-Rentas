"use client";
import { useState } from "react";
import { Home } from "lucide-react";

export default function BotonReservar({ propiedadId }: { propiedadId: string }) {
  const [cargando, setCargando] = useState(false);

  const handleRenta = async () => {
    const uid = localStorage.getItem("userId");
    if (!uid) return alert("Error de sesión");

    setCargando(true);
    const res = await fetch("/api/propiedades/rentar", {
      method: "POST",
      body: JSON.stringify({ propiedadId, usuarioId: uid }),
    });

    if (res.ok) {
      alert("¡Reserva exitosa! Bienvenido a tu nuevo hogar. 🏠");
      window.location.href = `/dashboard?uid=${uid}`;
    } else {
      alert("Error al procesar la reserva.");
      setCargando(false);
    }
  };

  return (
    <button 
      onClick={handleRenta}
      disabled={cargando}
      className="w-full bg-blue-600 hover:bg-white hover:text-slate-900 py-6 rounded-[30px] font-black uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 disabled:opacity-50"
    >
      {cargando ? "Vinculando cuenta..." : "Escoger y Reservar 🏠"}
    </button>
  );
}