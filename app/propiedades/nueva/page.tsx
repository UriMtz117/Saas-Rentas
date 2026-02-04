"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Home, MapPin, DollarSign, Save, ArrowLeft, Building2, Globe, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SubidaFotos from "../../../components/SubidaFotos";
import dynamic from "next/dynamic";

// Cargamos el mapa dinámicamente para evitar errores de servidor
const MapSelector = dynamic(() => import("../../../components/MapSelector"), { 
    ssr: false,
    loading: () => <div className="h-full w-full bg-slate-100 animate-pulse flex items-center justify-center font-black text-slate-300 uppercase italic">Cargando Mapa...</div>
});

export default function NuevaPropiedadPage() {
  const router = useRouter();
  const [fotos, setFotos] = useState<string[]>([]);
  const [coords, setCoords] = useState({ lat: 0, lng: 0 });
  const [cargando, setCargando] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (coords.lat === 0) return alert("Por favor selecciona la ubicación exacta en el mapa 📍");

    setCargando(true);
    const formData = new FormData(event.currentTarget);
    const uid = localStorage.getItem("userId");

    const data = {
      nombre: formData.get("nombre"),
      tipo: formData.get("tipo"),
      direccion: formData.get("direccion"),
      precio: parseFloat(formData.get("precio") as string),
      lat: coords.lat,
      lng: coords.lng,
      usuarioId: uid,
      fotos: fotos
    };

    const res = await fetch("/api/propiedades", {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (res.ok) router.push(`/propiedades?uid=${uid}`);
    else setCargando(false);
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-10 flex items-center justify-center font-sans">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="bg-white w-full max-w-6xl rounded-[60px] shadow-2xl border border-slate-100 overflow-hidden flex flex-col lg:row lg:flex-row min-h-[700px]">
        
        {/* IZQUIERDA: DATOS */}
        <div className="flex-1 p-8 md:p-12 space-y-8 overflow-y-auto custom-scrollbar">
            <Link href="/propiedades" className="text-slate-300 hover:text-slate-900 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 mb-4 transition"><ArrowLeft size={16}/> Volver</Link>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none italic">Publicar Inmueble</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-slate-400 ml-4">Nombre Comercial</label>
                        <input name="nombre" placeholder="Ej: Penthouse 201" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-[22px] outline-none font-bold" required />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-slate-400 ml-4">Categoría</label>
                        <select name="tipo" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-[22px] outline-none font-bold uppercase text-[10px] tracking-widest">
                            <option>Departamento</option><option>Casa</option><option>Cuarto</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-400 ml-4">Dirección Postal</label>
                    <div className="relative group">
                        <MapPin className="absolute left-5 top-5 text-red-500" size={18} />
                        <input name="direccion" placeholder="Calle, Ciudad, Estado..." className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-[25px] outline-none font-bold focus:border-blue-500 transition-all" required />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-400 ml-4">Precio de Renta Mensual</label>
                    <div className="relative">
                        <DollarSign className="absolute left-5 top-5 text-green-500" size={18} />
                        <input name="precio" type="number" placeholder="0.00" className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-[25px] outline-none font-black text-2xl" required />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-slate-400 ml-4 italic">Galería Premium</label>
                    <SubidaFotos onUploadComplete={(urls) => setFotos(urls)} />
                </div>

                <button disabled={cargando} type="submit" className="w-full bg-blue-600 text-white py-6 rounded-[30px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-3">
                    <Save size={20} /> {cargando ? "Sincronizando..." : "Publicar Ahora"}
                </button>
            </form>
        </div>

        {/* DERECHA: MAPA INTERACTIVO */}
        <div className="flex-1 bg-slate-900 p-6 relative flex flex-col">
            <div className="mb-4 flex justify-between items-center px-4">
                <p className="text-white font-black italic uppercase text-xs tracking-tighter flex items-center gap-2">
                    <Globe className="text-blue-500" size={14} /> Geolocalización Exacta
                </p>
                <div className="bg-green-500 text-white text-[8px] font-black px-2 py-1 rounded-md uppercase animate-pulse">GPS Live</div>
            </div>
            
            <div className="flex-1 relative">
                <MapSelector onLocationSelected={(lat, lng) => setCoords({ lat, lng })} />
            </div>

            <div className="mt-6 bg-white/5 backdrop-blur-xl p-6 rounded-[35px] border border-white/10 text-white">
                <p className="text-[9px] font-black uppercase text-blue-400 mb-2 tracking-widest italic">Instrucciones</p>
                <p className="text-xs font-medium opacity-70 leading-relaxed italic">Haz clic en el mapa para colocar el pin de ubicación exacta de la propiedad. Esto ayudará al inquilino a encontrarte más fácil.</p>
                {coords.lat !== 0 && (
                    <div className="mt-4 flex items-center gap-2 text-green-400 font-black text-[10px]">
                        <CheckCircle2 size={12}/> UBICACIÓN CAPTURADA: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
                    </div>
                )}
            </div>
        </div>
      </motion.div>
    </div>
  );
}