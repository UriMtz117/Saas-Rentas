"use client";
import { useEffect, useRef } from "react";

export default function InactivityGuard() {
  // Tiempo de inactividad (Ejemplo: 10 minutos = 600,000 ms)
  // Para probarlo rápido, ponle 10000 (10 segundos)
  const INACTIVITY_LIMIT = 10 * 60 * 1000; 
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const logout = () => {
    console.log("Sesión cerrada por inactividad");
    localStorage.clear();
    window.location.href = "/login?reason=inactivity";
  };

  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(logout, INACTIVITY_LIMIT);
  };

  useEffect(() => {
    // Eventos que cuentan como "actividad"
    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];

    // Iniciamos el temporizador
    resetTimer();

    // Agregamos los escuchas
    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    // Limpieza al desmontar el componente
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, []);

  return null; // Este componente no renderiza nada visual
}