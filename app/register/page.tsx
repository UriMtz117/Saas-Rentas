"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { UserPlus, Mail, Lock, User, ArrowRight, Shield, UserCircle, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [formData, setFormData] = useState({ nombre: "", email: "", password: "", rol: "PROPIETARIO" });
  const [error, setError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsRegistering(true);

    try {
        const res = await fetch("/api/register", { 
            method: "POST", 
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData) 
        });
        
        if (res.ok) {
            router.push("/login?success=true");
        } else {
            const data = await res.json();
            setError(data.error || "Error al crear cuenta. Intenta con otro correo.");
            setIsRegistering(false);
        }
    } catch (err) {
        setError("Error de conexión con el servidor.");
        setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-6 relative overflow-hidden">
      
      {/* Adorno visual de fondo */}
      <div className="absolute top-0 right-0 p-20 opacity-10 text-blue-600">
        <Shield size={400} />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="bg-white p-10 md:p-14 rounded-[55px] shadow-2xl w-full max-w-md border-t-[12px] border-blue-600 relative z-10"
      >
        <div className="flex justify-center mb-8">
            <div className="bg-blue-50 p-4 rounded-3xl text-blue-600 shadow-inner">
                <UserPlus size={40} />
            </div>
        </div>

        <h1 className="text-4xl font-black text-center text-slate-900 mb-2 italic uppercase tracking-tighter leading-none italic">Únete ahora</h1>
        <p className="text-center text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mb-10 italic">Crea tu ecosistema inmobiliario</p>

        {error && (
            <motion.p 
                initial={{ x: -10 }} 
                animate={{ x: 0 }} 
                className="bg-red-50 text-red-500 p-4 rounded-2xl text-[10px] text-center mb-6 font-black uppercase border border-red-100 italic"
            >
                {error}
            </motion.p>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          
          {/* INPUT NOMBRE */}
          <div className="relative group">
            <User className="absolute left-5 top-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input 
                type="text" 
                placeholder="Nombre completo" 
                required 
                className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition font-bold text-slate-700" 
                onChange={(e) => setFormData({...formData, nombre: e.target.value})} 
            />
          </div>

          {/* INPUT EMAIL */}
          <div className="relative group">
            <Mail className="absolute left-5 top-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input 
                type="email" 
                placeholder="Email institucional" 
                required 
                className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition font-bold text-slate-700" 
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
            />
          </div>

          {/* INPUT PASSWORD */}
          <div className="relative group">
            <Lock className="absolute left-5 top-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input 
                type="password" 
                placeholder="Contraseña segura" 
                required 
                className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition font-bold text-slate-700" 
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
            />
          </div>

          {/* SELECTOR DE ROL PREMIUM */}
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase text-slate-400 ml-5 italic tracking-widest">¿Cuál es tu función?</label>
            <div className="relative">
                <div className="absolute left-5 top-5 text-blue-500">
                    {formData.rol === "PROPIETARIO" ? <Building2 size={20}/> : <UserCircle size={20}/>}
                </div>
                <select 
                    className="w-full pl-14 pr-6 py-5 bg-slate-900 text-white rounded-3xl outline-none font-black uppercase text-[10px] tracking-widest cursor-pointer hover:bg-blue-600 transition-colors appearance-none"
                    onChange={(e) => setFormData({...formData, rol: e.target.value})}
                >
                    <option value="PROPIETARIO">🏢 SOY ARRENDADOR / DUEÑO</option>
                    <option value="INQUILINO">👤 SOY INQUILINO / RESIDENTE</option>
                </select>
            </div>
          </div>

          <button 
            disabled={isRegistering}
            className="w-full bg-blue-600 text-white py-6 rounded-[30px] font-black uppercase tracking-widest hover:bg-blue-700 transition shadow-xl shadow-blue-100 mt-6 flex items-center justify-center gap-2 group active:scale-95 disabled:opacity-50"
          >
            {isRegistering ? "Creando perfil..." : <>Crear Perfil <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" /></>}
          </button>
        </form>

        <p className="text-center mt-10 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            ¿Ya eres miembro? <Link href="/login" className="text-blue-600 hover:underline italic">Inicia sesión aquí</Link>
        </p>
      </motion.div>
    </div>
  );
}