"use client"; 
import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, MapPin, ChevronRight, Home, ShieldCheck, Building2, Globe } from "lucide-react";
import { motion } from "framer-motion";

export default function PropiedadesPage({ 
  searchParams 
}: { 
  searchParams: any 
}) {
  const [propiedades, setPropiedades] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [queryText, setQueryText] = useState("");

  // 1. CARGAR DATOS DE FORMA INTERNA (URL LIMPIA)
  const fetchData = async () => {
    // Obtenemos el ID desde el almacenamiento local
    const uid = localStorage.getItem("userId");
    
    if (!uid) {
        window.location.href = "/login";
        return;
    }

    try {
        // Obtenemos el perfil para saber el ROL
        const userRes = await fetch(`/api/login/verificar?uid=${uid}`);
        const userData = await userRes.json();
        setUser(userData);

        // Obtenemos las propiedades filtradas por el servidor (usando el UID interno)
        const propRes = await fetch(`/api/propiedades?uid=${uid}&q=${queryText}`);
        const propData = await propRes.json();
        setPropiedades(propData);
    } catch (error) {
        console.error("Error de sincronización:", error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [queryText]); // Se actualiza cada vez que el usuario escribe en el buscador

  const isAdmin = user?.rol === "ADMIN";
  const isTenant = user?.rol === "INQUILINO";

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#f8fafc]">
        <motion.div 
            animate={{ rotate: 360 }} 
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mb-4"
        />
        <p className="font-black text-slate-300 uppercase tracking-[0.4em] italic text-xs">InmoGestion AI</p>
    </div>
  );

  return (
    <div className="p-4 md:p-8 bg-[#f8fafc] min-h-screen font-sans text-slate-900 italic-none">
      <div className="max-w-7xl mx-auto">
        
        {/* --- ENCABEZADO PREMIUM --- */}
        <div className="flex flex-col lg:flex-row justify-between items-center mb-16 gap-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-2 mb-2">
                {isAdmin && <span className="bg-blue-600 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1 shadow-lg shadow-blue-200"><ShieldCheck size={10} /> Consola Global</span>}
                {isTenant && <span className="bg-blue-50 text-blue-600 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-blue-100 italic">Mis Residencias</span>}
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase italic leading-none italic">
                {isTenant ? "Mis Casas" : "Inventario"}
            </h1>
          </motion.div>

          {/* BUSCADOR CON FILTRO EN TIEMPO REAL */}
          <div className="w-full lg:max-w-xl relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={24} />
            <input 
                type="text"
                placeholder="Busca por calle, zona o nombre..." 
                className="w-full pl-16 pr-8 py-6 bg-white border border-slate-100 rounded-[40px] shadow-2xl shadow-blue-500/5 outline-none font-bold text-lg focus:ring-4 focus:ring-blue-500/5 transition-all"
                onChange={(e) => setQueryText(e.target.value)}
            />
          </div>
          
          {/* BOTÓN REGISTRAR: Oculto para Inquilinos */}
          {!isTenant && (
            <Link href="/propiedades/nueva" className="bg-slate-900 hover:bg-blue-600 text-white px-10 py-5 rounded-[25px] font-black text-xs uppercase tracking-widest shadow-2xl transition-all flex items-center gap-2 group active:scale-95 shrink-0">
                <Plus size={20} className="group-hover:rotate-90 transition-transform" /> Registrar Propiedad
            </Link>
          )}
        </div>

        {/* --- GRID CON EVENTO DE SCROLL (REVEAL) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {propiedades.map((p: any, index: number) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
            >
              {/* URL LIMPIA EN EL LINK */}
              <Link href={`/propiedades/${p.id}`} className="group block h-full">
                <div className="bg-white rounded-[60px] shadow-sm border border-slate-100 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-700 flex flex-col h-full relative">
                    
                    {/* EVENTO MOUSE: EL MAPA CAMBIA DE COLOR EN HOVER */}
                    <div className="h-64 w-full bg-slate-100 relative grayscale group-hover:grayscale-0 transition-all duration-1000 border-b border-slate-50">
                        <iframe 
                            width="100%" 
                            height="100%" 
                            loading="lazy" 
                            frameBorder="0" 
                            src={`https://maps.google.com/maps?q=${encodeURIComponent(p.direccion)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                        ></iframe>
                        <div className="absolute top-5 right-5 bg-white/90 backdrop-blur-md p-2.5 rounded-2xl shadow-xl text-red-500 border border-white">
                            <MapPin size={20} />
                        </div>
                    </div>

                    <div className="p-10 flex-1 flex flex-col justify-between">
                        <div>
                            <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase mb-2 italic line-clamp-1 italic italic">{p.nombre}</h2>
                            <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest mb-10 italic">
                                <Globe size={14} className="text-blue-500"/> {p.direccion}
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-8 border-t border-slate-50">
                            <div>
                                <p className="text-[10px] font-black text-slate-300 uppercase mb-1 italic">Renta Mensual</p>
                                <p className="text-3xl font-black text-blue-600 tracking-tighter italic">${p.precio.toLocaleString()}</p>
                            </div>
                            <div className="bg-slate-900 text-white p-5 rounded-[25px] group-hover:bg-blue-600 transition-all shadow-xl shadow-blue-500/10">
                                <ChevronRight size={24}/>
                            </div>
                        </div>
                    </div>

                    {/* Badge informativo solo para Admin */}
                    {isAdmin && (
                        <div className="absolute top-4 left-4 bg-slate-900/60 backdrop-blur-md text-[8px] text-white px-2 py-1 rounded-md font-black uppercase tracking-widest">
                            Owner ID: {p.usuarioId.slice(0,5)}...
                        </div>
                    )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* ESTADO DE CERO RESULTADOS */}
        {propiedades.length === 0 && (
            <div className="py-40 text-center flex flex-col items-center">
                <div className="bg-slate-50 p-10 rounded-full mb-6 border border-slate-100 shadow-inner">
                    <Building2 size={64} className="text-slate-100" />
                </div>
                <h3 className="font-black italic uppercase text-3xl tracking-tighter text-slate-400">Sin Unidades</h3>
                <p className="text-slate-300 font-bold text-sm mt-1 uppercase tracking-widest italic text-balance px-20">No se localizaron registros vinculados a este perfil privado.</p>
            </div>
        )}
      </div>
    </div>
  );
}