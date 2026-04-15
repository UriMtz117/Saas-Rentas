"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Home, MapPin, DollarSign, Save, ArrowLeft, Building2, Globe, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SubidaFotos from "@/components/SubidaFotos"; // Usando alias @ para evitar errores
import dynamic from "next/dynamic";

// Cargamos el mapa dinámicamente para evitar errores de servidor (SSR)
const MapSelector = dynamic(() => import("@/components/MapSelector"), { 
    ssr: false,
    loading: () => (
        <div className="h-full w-full bg-slate-100 animate-pulse flex flex-col items-center justify-center font-black text-slate-300 uppercase italic gap-4">
            <Globe className="animate-spin" />
            Cargando Capas de Mapa...
        </div>
    )
});

export default function NuevaPropiedadPage() {
  const router = useRouter();
  const [fotos, setFotos] = useState<string[]>([]);
  const [coords, setCoords] = useState({ lat: 0, lng: 0 });
  const [cargando, setCargando] = useState(false);

  // MANEJO DEL ENVÍO DEL FORMULARIO
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Verificación de ubicación
    if (coords.lat === 0) {
        return alert("Por favor selecciona la ubicación exacta en el mapa 📍");
    }

    setCargando(true);
    const formData = new FormData(event.currentTarget);
    
    // Obtenemos el ID del usuario de forma interna (Seguridad)
    const uid = localStorage.getItem("userId");

    if (!uid) {
        alert("Sesión expirada. Por favor inicia sesión de nuevo.");
        router.push("/login");
        return;
    }

    const data = {
      nombre: formData.get("nombre"),
      tipo: formData.get("tipo"),
      direccion: formData.get("direccion"),
      precio: parseFloat(formData.get("precio") as string),
      lat: coords.lat,
      lng: coords.lng,
      usuarioId: uid, // Vinculamos la casa al dueño logueado
      fotos: fotos // URLs de Supabase Storage
    };

    try {
        const res = await fetch("/api/propiedades", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
    
        if (res.ok) {
          // REDIRECCIÓN A URL LIMPIA
          router.push("/propiedades"); 
        } else {
          alert("Error al registrar la propiedad en la base de datos.");
          setCargando(false);
        }
    } catch (error) {
        console.error(error);
        alert("Fallo de conexión con el servidor.");
        setCargando(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-10 flex items-center justify-center font-sans italic-none">
      <motion.div 
        initial={{ opacity: 0, y: 30 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="bg-white w-full max-w-6xl rounded-[60px] shadow-2xl border border-slate-100 overflow-hidden flex flex-col lg:flex-row min-h-[750px]"
      >
        
        {/* --- LADO IZQUIERDO: CAPTURA DE DATOS --- */}
        <div className="flex-1 p-8 md:p-14 space-y-10 overflow-y-auto custom-scrollbar">
            <Link href="/propiedades" className="text-slate-300 hover:text-slate-900 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 mb-4 transition italic">
                <ArrowLeft size={16}/> Volver al Inventario
            </Link>
            
            <header>
                <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none italic">Publicar Unidad</h1>
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2">Nueva Propiedad en InmoGestion AI</p>
            </header>
            
            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-4 italic">Nombre del Inmueble</label>
                        <input name="nombre" placeholder="Ej: Departamento 102" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[25px] outline-none font-bold text-slate-700 focus:border-blue-500 transition-all shadow-inner" required />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-4 italic">Categoría</label>
                        <select name="tipo" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[25px] outline-none font-bold uppercase text-[10px] tracking-widest text-slate-700 shadow-inner cursor-pointer">
                            <option value="Departamento">🏙️ Departamento</option>
                            <option value="Casa">🏡 Casa Residencial</option>
                            <option value="Cuarto">🛏️ Cuarto / Habitación</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-4 italic">Ubicación Descriptiva</label>
                    <div className="relative group">
                        <MapPin className="absolute left-5 top-5 text-red-500" size={20} />
                        <input name="direccion" placeholder="Calle, Número, Colonia, Ciudad..." className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-[25px] outline-none font-bold focus:border-blue-500 transition-all shadow-inner text-slate-700" required />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-4 italic">Renta Mensual Sugerida</label>
                    <div className="relative">
                        <DollarSign className="absolute left-5 top-5 text-green-600" size={20} />
                        <input name="precio" type="number" placeholder="0.00" className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-[25px] outline-none font-black text-2xl text-slate-800 shadow-inner focus:border-blue-500 transition-all" required />
                    </div>
                </div>

                {/* GALERÍA DE FOTOS (SUBIR A SUPABASE) */}
                <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-4 italic tracking-widest">Fotografías del Inmueble</label>
                    <SubidaFotos onUploadComplete={(urls) => setFotos(urls)} />
                </div>

                <button 
                    disabled={cargando} 
                    type="submit" 
                    className="w-full bg-blue-600 text-white py-6 rounded-[30px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-2xl shadow-blue-100 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                >
                    <Save size={20} /> {cargando ? "Sincronizando..." : "Publicar Ahora"}
                </button>
            </form>
        </div>

        {/* --- LADO DERECHO: MAPA INTERACTIVO (EL MONITO) --- */}
        <div className="flex-1 bg-slate-900 p-6 relative flex flex-col">
            <div className="mb-6 flex justify-between items-center px-4">
                <p className="text-white font-black italic uppercase text-xs tracking-tighter flex items-center gap-2">
                    <Globe className="text-blue-500" size={16} /> Geolocalización Satelital
                </p>
                <div className="bg-green-500 text-white text-[8px] font-black px-3 py-1 rounded-md uppercase animate-pulse shadow-lg shadow-green-500/20">GPS Activo</div>
            </div>
            
            {/* Componente del Mapa con el Pin */}
            <div className="flex-1 relative shadow-2xl">
                <MapSelector onLocationSelected={(lat, lng) => setCoords({ lat, lng })} />
            </div>

            <div className="mt-8 bg-white/5 backdrop-blur-xl p-8 rounded-[40px] border border-white/10 text-white shadow-inner">
                <p className="text-[10px] font-black uppercase text-blue-400 mb-2 tracking-widest italic italic">Instrucciones de Ubicación</p>
                <p className="text-xs font-medium opacity-70 leading-relaxed italic">Haz clic en el mapa para colocar el pin de ubicación exacta. Esto permitirá que los inquilinos te localicen mediante el radar del sistema.</p>
                
                {coords.lat !== 0 && (
                    <motion.div 
                        initial={{ opacity: 0, x: -10 }} 
                        animate={{ opacity: 1, x: 0 }}
                        className="mt-6 flex items-center gap-3 text-green-400 font-black text-[10px] bg-green-400/10 p-3 rounded-2xl border border-green-400/20"
                    >
                        <CheckCircle2 size={16}/> 
                        PUNTO CAPTURADO: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                    </motion.div>
                )}
            </div>
        </div>
      </motion.div>
    </div>
  );
}