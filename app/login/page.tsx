"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, Shield, User } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Lógica sencilla para tu entrega:
    if (email === "admin@admin.com" && password === "123") {
      localStorage.setItem("role", "ADMIN");
      router.push("/admin");
    } else {
      localStorage.setItem("role", "USER");
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-6">
      <div className="bg-white p-10 rounded-[40px] shadow-2xl w-full max-w-md border-t-8 border-blue-600">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-50 p-4 rounded-3xl text-blue-600">
            <Shield size={40} />
          </div>
        </div>
        
        <h1 className="text-3xl font-black text-center text-slate-900 mb-2 italic">InmoGestion</h1>
        <p className="text-center text-slate-400 text-sm mb-10">Acceso seguro al sistema de rentas</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-4 text-slate-300" size={20} />
            <input 
              type="email" 
              placeholder="Correo electrónico" 
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-500 transition"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <input 
            type="password" 
            placeholder="Contraseña" 
            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-500 transition"
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition shadow-xl shadow-blue-100 mt-4 flex items-center justify-center gap-2">
            <LogIn size={20} /> Ingresar
          </button>
        </form>
      </div>
    </div>
  );
}