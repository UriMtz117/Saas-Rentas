"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Zap, MessageSquare, BarChart, Home, UserCircle, ArrowRight } from "lucide-react";

export default function LandingPage() {
  const [loading, setLoading] = useState(true);

  // LÓGICA DE PROTECCIÓN: Si hay sesión, expulsa al usuario hacia su Dashboard
  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role === "ADMIN") {
      window.location.href = "/admin";
    } else if (role === "USER") {
      window.location.href = "/dashboard";
    } else {
      setLoading(false); // Si no hay nadie, mostramos la publicidad
    }
  }, []);

  // Mientras revisa la sesión, mostramos un fondo neutro para evitar parpadeos
  if (loading) return <div className="bg-slate-900 h-screen w-full flex items-center justify-center text-white font-black italic">CARGANDO...</div>;

  return (
    <div className="bg-[#f8fafc] min-h-screen font-sans">
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg"><Home size={18} className="text-white"/></div>
            <span className="text-white font-black tracking-tighter text-xl italic uppercase">InmoGestion <span className="text-blue-500 underline decoration-blue-500/30">AI</span></span>
          </div>
          <Link href="/login" className="text-slate-400 hover:text-white text-[10px] font-black uppercase tracking-[0.2em] transition flex items-center gap-2 group">
            Acceso Clientes <UserCircle size={18} className="group-hover:text-blue-50 transition"/>
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="pt-40 pb-24 px-6 text-center bg-slate-900 text-white rounded-b-[80px] shadow-2xl relative overflow-hidden text-balance">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-20 left-10 w-64 h-64 bg-blue-600 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-10 right-10 w-64 h-64 bg-indigo-600 rounded-full blur-[120px]"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-block bg-blue-500/10 border border-blue-500/20 text-blue-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-8 italic">
            Proptech de Próxima Generación
          </div>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-8 italic leading-[0.9]">
            Gestiona rentas con <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Inteligencia Real.</span>
          </h1>
          <p className="text-slate-400 text-xl max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
            La plataforma definitiva para arrendadores modernos. Automatiza cobranzas, centraliza contratos y obtén reportes inteligentes.
          </p>
          
          <div className="flex flex-col md:flex-row justify-center gap-5">
            <Link href="/register" className="bg-blue-600 px-10 py-5 rounded-[25px] font-black uppercase tracking-[0.15em] text-sm hover:bg-blue-700 transition shadow-2xl shadow-blue-600/30 flex items-center justify-center gap-2 group">
              Comenzar Ahora <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform"/>
            </Link>
            <button className="bg-slate-800/50 border border-slate-700 px-10 py-5 rounded-[25px] font-black uppercase tracking-[0.15em] text-sm hover:bg-slate-800 transition">
              Ver Demo Interactiva
            </button>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-7xl mx-auto py-32 px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-10 bg-white rounded-[50px] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all group">
            <div className="bg-blue-50 text-blue-600 p-5 rounded-[22px] w-fit mb-8 group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-inner">
                <Zap size={28} />
            </div>
            <h3 className="font-black text-2xl mb-4 italic tracking-tight uppercase">Gestión con IA</h3>
            <p className="text-slate-500 text-sm leading-relaxed font-medium text-pretty">Pregunta sobre deudas y contratos a nuestro asistente basado en Gemini IA.</p>
          </div>

          <div className="p-10 bg-white rounded-[50px] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all group">
            <div className="bg-green-50 text-green-600 p-5 rounded-[22px] w-fit mb-8 group-hover:bg-green-600 group-hover:text-white transition-colors shadow-inner">
                <MessageSquare size={28} />
            </div>
            <h3 className="font-black text-2xl mb-4 italic tracking-tight uppercase">Cobro Smart</h3>
            <p className="text-slate-500 text-sm leading-relaxed font-medium text-pretty">Notifica a tus inquilinos vía WhatsApp con un solo clic. Mensajes personalizados.</p>
          </div>

          <div className="p-10 bg-white rounded-[50px] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all group">
            <div className="bg-purple-50 text-purple-600 p-5 rounded-[22px] w-fit mb-8 group-hover:bg-purple-600 group-hover:text-white transition-colors shadow-inner">
                <BarChart size={28} />
            </div>
            <h3 className="font-black text-2xl mb-4 italic tracking-tight uppercase">Reportes Pro</h3>
            <p className="text-slate-500 text-sm leading-relaxed font-medium text-pretty">Analítica financiera avanzada para conocer la rentabilidad real de tu negocio.</p>
          </div>
      </section>
    </div>
  );
}