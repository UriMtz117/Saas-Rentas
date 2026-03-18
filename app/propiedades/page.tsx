"use client"; // Necesario para framer-motion y scroll
import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, MapPin, ChevronRight, Home, ShieldCheck, Building2 } from "lucide-react";
import { motion } from "framer-motion";

export default function PropiedadesPage({ searchParams }: { searchParams: any }) {
  const [propiedades, setPropiedades] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const params = await searchParams;
      const uid = params.uid || localStorage.getItem("userId");
      const q = params.q || "";

      const resProp = await fetch(`/api/propiedades?uid=${uid}&q=${q}`);
      const dataProp = await resProp.json();
      setPropiedades(dataProp);
      
      const resUser = await fetch(`/api/login/verificar?uid=${uid}`);
      const dataUser = await resUser.json();
      setUser(dataUser);
      setLoading(false);
    };
    fetchData();
  }, [searchParams]);

  const isAdmin = user?.rol === "ADMIN";
  const isOwner = user?.rol === "PROPIETARIO";

  if (loading) return <div className="h-screen flex items-center justify-center font-black italic text-slate-300 animate-pulse uppercase tracking-[0.4em]">InmoGestion...</div>;

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        
        {/* ENCABEZADO CON ANIMACIÓN DE ENTRADA */}
        <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row justify-between items-center mb-16 gap-8"
        >
          <div>
            <h1 className="text-6xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">Inventario</h1>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2 italic italic italic">Exploración de activos inmobiliarios</p>
          </div>

          <form className="w-full lg:max-w-xl relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={24} />
            <input name="q" placeholder="Buscar casa o calle..." className="w-full pl-16 pr-8 py-6 bg-white border border-slate-100 rounded-[40px] shadow-2xl outline-none font-bold text-lg focus:ring-4 focus:ring-blue-500/5 transition-all" />
          </form>
          
          {user?.rol !== "INQUILINO" && (
            <Link href={`/propiedades/nueva?uid=${user?.id}`} className="bg-slate-900 text-white px-10 py-5 rounded-[25px] font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-blue-600 transition-all flex items-center gap-2 group active:scale-95">
                <Plus size={20} className="group-hover:rotate-90 transition-transform" /> Nueva
            </Link>
          )}
        </motion.div>

        {/* GRID CON EVENTO DE SCROLL (REVEAL) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {propiedades.map((p: any, i: number) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }} // REQUERIMIENTO: EVENTO DE SCROLL
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <Link href={`/propiedades/${p.id}?uid=${user?.id}`} className="group block h-full">
                <div className="bg-white rounded-[60px] shadow-sm border border-slate-100 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-700 flex flex-col h-full relative">
                    {/* EVENTO MOUSE: MAPA QUE CAMBIA DE COLOR */}
                    <div className="h-64 w-full bg-slate-100 relative grayscale group-hover:grayscale-0 transition-all duration-1000 border-b">
                        <iframe width="100%" height="100%" loading="lazy" frameBorder="0" src={`https://maps.google.com/maps?q=${encodeURIComponent(p.direccion)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}></iframe>
                    </div>

                    <div className="p-10 flex-1 flex flex-col justify-between">
                        <div>
                            <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase mb-2 italic line-clamp-1 italic italic italic italic italic">{p.nombre}</h2>
                            <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest mb-10"><MapPin size={14} className="text-red-500" /> {p.direccion}</div>
                        </div>
                        <div className="flex justify-between items-center pt-8 border-t">
                            <div><p className="text-[10px] font-black text-slate-300 uppercase mb-1 italic">Renta</p><p className="text-3xl font-black text-blue-600 tracking-tighter italic">${p.precio.toLocaleString()}</p></div>
                            <motion.div whileHover={{ x: 5 }} className="bg-slate-900 text-white p-5 rounded-[25px] group-hover:bg-blue-600 transition-colors"><ChevronRight size={24}/></motion.div>
                        </div>
                    </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}