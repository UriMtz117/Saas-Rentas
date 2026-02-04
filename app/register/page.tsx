"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { UserPlus, Mail, Lock, User, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [formData, setFormData] = useState({ nombre: "", email: "", password: "", rol: "PROPIETARIO" });
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/register", { method: "POST", body: JSON.stringify(formData) });
    if (res.ok) router.push("/login?success=true");
    else setError("Error al crear cuenta. Intenta con otro correo.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-12 rounded-[55px] shadow-2xl w-full max-w-md border-t-[12px] border-blue-600">
        <h1 className="text-4xl font-black text-center text-slate-900 mb-2 italic uppercase italic tracking-tighter leading-none mb-10">Únete ahora</h1>
        {error && <p className="text-red-500 text-xs font-bold text-center mb-4 italic uppercase">{error}</p>}
        <form onSubmit={handleRegister} className="space-y-5">
          <input type="text" placeholder="Nombre completo" required className="w-full p-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none font-bold" onChange={(e) => setFormData({...formData, nombre: e.target.value})} />
          <input type="email" placeholder="Email" required className="w-full p-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none font-bold" onChange={(e) => setFormData({...formData, email: e.target.value})} />
          <input type="password" placeholder="Contraseña" required className="w-full p-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none font-bold" onChange={(e) => setFormData({...formData, password: e.target.value})} />
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest italic">Selecciona tu función:</label>
            <select className="w-full p-5 bg-slate-900 text-white rounded-3xl outline-none font-black uppercase text-[10px] tracking-widest" onChange={(e) => setFormData({...formData, rol: e.target.value})}>
                <option value="PROPIETARIO">🏢 Soy Arrendador / Dueño</option>
                <option value="INQUILINO">👤 Soy Inquilino / Residente</option>
            </select>
          </div>
          <button className="w-full bg-blue-600 text-white py-6 rounded-[30px] font-black uppercase tracking-widest hover:bg-blue-700 transition shadow-xl mt-6 flex items-center justify-center gap-2 group active:scale-95">Crear Perfil <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" /></button>
        </form>
      </motion.div>
    </div>
  );
}