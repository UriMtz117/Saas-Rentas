"use client"; // Necesario para las animaciones y efectos
import { motion } from "framer-motion";
import { User, Mail, Phone, Home, Calendar, Save, ArrowLeft, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Nota: He movido la lógica de datos a un formato compatible con "use client"
export default function NuevoInquilinoPage() {
  const router = useRouter();
  const [propiedades, setPropiedades] = useState<any[]>([]);

  // Cargamos las propiedades para el select
  useEffect(() => {
    fetch("/api/propiedades") // Necesitarás un pequeño endpoint API o pasar los datos como props
      .then(res => res.json())
      .then(data => setPropiedades(data));
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    // Llamamos a un Server Action o API para guardar
    const res = await fetch("/api/inquilinos", {
      method: "POST",
      body: JSON.stringify(Object.fromEntries(formData)),
    });

    if (res.ok) router.push("/inquilinos");
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 md:p-10">
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-white w-full max-w-2xl rounded-[45px] shadow-2xl shadow-blue-100 overflow-hidden border border-slate-100"
      >
        {/* Cabecera Estilo SaaS */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-10 text-white relative text-center">
          <Link href="/inquilinos" className="absolute left-8 top-11 text-blue-200 hover:text-white transition-transform hover:-translate-x-1">
            <ArrowLeft size={24} />
          </Link>
          <div className="inline-flex p-3 bg-white/10 rounded-2xl mb-4 backdrop-blur-sm">
            <UserPlus size={32} />
          </div>
          <h1 className="text-3xl font-black italic tracking-tighter">Alta de Inquilino</h1>
          <p className="text-blue-100 text-sm font-medium opacity-80 mt-1">Vincula un nuevo arrendatario a tu propiedad</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Nombre Completo */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-[0.2em]">Nombre del Inquilino</label>
              <div className="relative group">
                <User className="absolute left-4 top-4 text-slate-300 group-focus-within:text-blue-500 transition" size={18} />
                <input 
                  name="nombre" 
                  type="text" 
                  placeholder="Juan Pérez..." 
                  required
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-bold text-slate-700"
                />
              </div>
            </div>

            {/* Correo Electrónico */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-[0.2em]">Correo de Contacto</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-4 text-slate-300 group-focus-within:text-blue-500 transition" size={18} />
                <input 
                  name="correo" 
                  type="email" 
                  placeholder="ejemplo@mail.com" 
                  required
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-bold text-slate-700"
                />
              </div>
            </div>

            {/* Teléfono WhatsApp */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-[0.2em]">Teléfono (WhatsApp)</label>
              <div className="relative group">
                <Phone className="absolute left-4 top-4 text-slate-300 group-focus-within:text-blue-500 transition" size={18} />
                <input 
                  name="telefono" 
                  type="text" 
                  placeholder="52 427..." 
                  required
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-bold text-slate-700"
                />
              </div>
            </div>

            {/* Fecha Vencimiento Contrato */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-[0.2em]">Fin de Contrato</label>
              <div className="relative group">
                <Calendar className="absolute left-4 top-4 text-slate-300 group-focus-within:text-blue-500 transition" size={18} />
                <input 
                  name="fechaFin" 
                  type="date" 
                  required
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-bold text-slate-700"
                />
              </div>
            </div>

            {/* Asignación de Propiedad */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-[0.2em]">Unidad a Rentar</label>
              <div className="relative group">
                <Home className="absolute left-4 top-4 text-slate-300 group-focus-within:text-blue-500 transition" size={18} />
                <select 
                  name="propiedadId" 
                  required
                  className="w-full pl-12 pr-10 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none appearance-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-bold text-slate-700 cursor-pointer"
                >
                  <option value="">Selecciona una propiedad disponible...</option>
                  {propiedades.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.nombre} - ${p.precio.toLocaleString()}</option>
                  ))}
                </select>
              </div>
            </div>

          </div>

          {/* Botón Guardar Animado */}
          <motion.button 
            whileHover={{ scale: 1.02, backgroundColor: "#1e293b" }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full bg-slate-900 text-white py-5 rounded-[25px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-slate-200 transition-all flex items-center justify-center gap-3 mt-4"
          >
            <Save size={20} /> Registrar Inquilino
          </motion.button>

        </form>
      </motion.div>

    </div>
  );
}