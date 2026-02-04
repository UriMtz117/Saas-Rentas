"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, LogIn, User, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
        const res = await fetch("/api/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
    
        const data = await res.json();
    
        if (res.ok) {
          localStorage.setItem("role", data.user.rol);
          localStorage.setItem("userId", data.user.id);
          
          // MANDAMOS EL ID POR URL PARA FILTRAR EL DASHBOARD
          if (data.user.rol === "ADMIN") {
            window.location.href = "/admin"; 
          } else {
            window.location.href = `/dashboard?uid=${data.user.id}`; 
          }
        } else {
          setError("Credenciales inválidas.");
        }
    } catch (err) {
        setError("Error de conexión.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-6">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-12 rounded-[50px] shadow-2xl w-full max-w-md border-t-8 border-blue-600">
        <div className="flex justify-center mb-8"><div className="bg-blue-600 p-4 rounded-3xl text-white shadow-lg"><LogIn size={40} /></div></div>
        <h1 className="text-3xl font-black text-center text-slate-900 mb-2 italic uppercase">InmoGestion</h1>
        <p className="text-center text-slate-400 text-xs mb-10 font-bold uppercase tracking-widest italic">Privacidad Garantizada</p>

        {error && <p className="bg-red-50 text-red-500 p-4 rounded-2xl text-[10px] text-center mb-6 font-black uppercase border border-red-100">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" placeholder="Correo" className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition font-bold text-slate-700" onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Contraseña" className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition font-bold text-slate-700" onChange={(e) => setPassword(e.target.value)} required />
          <button className="w-full bg-blue-600 text-white py-5 rounded-[25px] font-black uppercase tracking-widest hover:bg-blue-700 transition shadow-xl mt-6 flex items-center justify-center gap-2 group active:scale-95">
            Ingresar <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
      </motion.div>
    </div>
  );
}