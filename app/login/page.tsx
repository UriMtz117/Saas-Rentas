"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, LogIn, User, Lock, ArrowRight, Fingerprint } from "lucide-react";
import Link from "next/link";
import Cookies from "js-cookie"; // <--- NUEVA LIBRERÍA

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // 1. LÓGICA DE LOGIN NORMAL (Limpiando la URL)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoggingIn(true);

    try {
        const res = await fetch("/api/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
    
        const data = await res.json();
    
        if (res.ok) {
          // --- GUARDAR EN COOKIES (Invisible en la URL) ---
          Cookies.set("userId", data.user.id, { expires: 1 }); // Dura 1 día
          Cookies.set("role", data.user.rol, { expires: 1 });
          
          // Guardamos el nombre en localStorage para el Sidebar
          localStorage.setItem("role", data.user.rol);
          localStorage.setItem("userId", data.user.id);
          localStorage.setItem("userName", data.user.nombre); 

          // --- REDIRECCIÓN LIMPIA ---
          if (data.user.rol === "ADMIN") {
            window.location.href = "/admin"; 
          } else {
            window.location.href = "/dashboard"; // <--- YA NO LLEVA EL ?uid=
          }
        } else {
          setError("Credenciales inválidas.");
          setIsLoggingIn(false);
        }
    } catch (err) {
        setError("Error de conexión.");
        setIsLoggingIn(false);
    }
  };

  // 2. LÓGICA BIOMÉTRICA (También con URL Limpia)
  const handleBiometricAuth = async () => {
    if (!window.PublicKeyCredential) {
      alert("Este navegador no soporta biometría.");
      return;
    }

    try {
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array([1, 2, 3, 4, 5]),
          userVerification: "required",
        }
      });

      if (credential) {
        const savedRole = localStorage.getItem("role");
        const savedId = localStorage.getItem("userId");

        if (savedId && savedRole) {
            // Aseguramos que la cookie esté puesta antes de entrar
            Cookies.set("userId", savedId, { expires: 1 });
            Cookies.set("role", savedRole, { expires: 1 });
            
            window.location.href = savedRole === "ADMIN" ? "/admin" : "/dashboard";
        } else {
            setError("Primero ingresa con contraseña para registrar tu huella.");
        }
      }
    } catch (err) {
      console.log("Biometría cancelada");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-6 relative overflow-hidden">
      
      {/* Fondo decorativo */}
      <div className="absolute top-0 right-0 p-20 opacity-10 text-blue-600">
        <Shield size={400} />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="bg-white p-12 rounded-[55px] shadow-2xl w-full max-w-md border-t-[12px] border-blue-600 relative z-10"
      >
        <div className="flex justify-center mb-8">
            <div className="bg-blue-50 p-4 rounded-3xl text-blue-600 shadow-inner">
                <LogIn size={40} />
            </div>
        </div>

        <h1 className="text-4xl font-black text-center text-slate-900 mb-2 italic uppercase tracking-tighter leading-none">InmoGestion</h1>
        <p className="text-center text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mb-8 italic">Secure Access Portal</p>
        
        {error && (
            <motion.p initial={{ x: -10 }} animate={{ x: 0 }} className="bg-red-50 text-red-500 p-4 rounded-2xl text-[10px] text-center mb-6 font-black uppercase border border-red-100 italic">
                {error}
            </motion.p>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            type="email" 
            placeholder="Correo institucional" 
            className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition font-bold text-slate-700" 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
          <input 
            type="password" 
            placeholder="Contraseña" 
            className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition font-bold text-slate-700" 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
          <button 
            disabled={isLoggingIn}
            className="w-full bg-blue-600 text-white py-5 rounded-[25px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-blue-100 active:scale-95 flex items-center justify-center gap-2 group"
          >
            {isLoggingIn ? "Autenticando..." : <>Ingresar <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" /></>}
          </button>
        </form>

        <div className="flex flex-col gap-4 mt-6">
            <Link href="/login/recuperar" className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors">¿Olvidaste tu clave?</Link>
        </div>

        {/* SECCIÓN BIOMÉTRICA */}
        <div className="relative my-10">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100"></span></div>
          <div className="relative flex justify-center text-[9px] uppercase font-black text-slate-300"><span className="bg-white px-4 tracking-[0.4em]">Biometric ID</span></div>
        </div>

        <button 
          onClick={handleBiometricAuth}
          className="w-full group flex flex-col items-center gap-3 p-6 rounded-[35px] border-2 border-slate-50 hover:border-blue-100 hover:bg-blue-50/30 transition-all duration-500"
        >
          <div className="bg-slate-900 text-white p-4 rounded-2xl group-hover:bg-blue-600 transition-colors shadow-lg shadow-slate-200 group-hover:shadow-blue-200 group-hover:scale-110 transition-transform">
            <Fingerprint size={32} className="animate-pulse" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-blue-600 italic">Acceder con Huella Digital</span>
        </button>

      </motion.div>
    </div>
  );
}