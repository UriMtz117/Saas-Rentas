"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Send, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function RecuperarPage() {
  const [enviado, setEnviado] = useState(false);

  const handleReset = (e: any) => {
    e.preventDefault();
    // Aquí se llamaría a la API
    setEnviado(true);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 font-sans">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-12 rounded-[50px] shadow-2xl w-full max-w-md border-t-8 border-blue-600">
        {!enviado ? (
          <>
            <Link href="/login" className="text-slate-400 hover:text-slate-900 font-black text-[10px] uppercase mb-8 flex items-center gap-2 transition italic"><ArrowLeft size={14}/> Volver al login</Link>
            <h1 className="text-3xl font-black text-slate-900 mb-2 italic tracking-tighter">Recuperar Acceso</h1>
            <p className="text-slate-400 text-xs mb-10 font-bold uppercase tracking-widest leading-loose">Ingresa tu correo institucional para enviarte un enlace de restablecimiento.</p>
            <form onSubmit={handleReset} className="space-y-6">
              <div className="relative group">
                <Mail className="absolute left-5 top-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input type="email" placeholder="correo@ejemplo.com" required className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:ring-4 focus:ring-blue-500/5 transition font-bold" />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-[25px] font-black uppercase tracking-widest hover:bg-slate-900 transition shadow-xl shadow-blue-100 flex items-center justify-center gap-2">Enviar Enlace <Send size={18}/></button>
            </form>
          </>
        ) : (
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-center py-10">
            <div className="bg-green-100 text-green-600 w-20 h-20 rounded-[30px] flex items-center justify-center mx-auto mb-8 shadow-lg shadow-green-100"><CheckCircle2 size={40} /></div>
            <h2 className="text-2xl font-black italic text-slate-900 mb-4">¡ENLACE ENVIADO!</h2>
            <p className="text-slate-400 font-medium text-sm leading-relaxed mb-10 italic">Si el correo está registrado en InmoGestion AI, recibirás instrucciones en unos minutos.</p>
            <Link href="/login" className="text-blue-600 font-black text-xs uppercase tracking-widest hover:underline italic">Regresar ahora</Link>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}