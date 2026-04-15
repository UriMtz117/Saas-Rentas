"use client";
import { motion } from "framer-motion";
import { User, Mail, Phone, Home, Calendar, Save, ArrowLeft, UserPlus, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function NuevoInquilinoPage() {
  const router = useRouter();
  const [propiedades, setPropiedades] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  // 1. CARGAR SOLO LAS PROPIEDADES DEL USUARIO LOGUEADO
  useEffect(() => {
    const uid = localStorage.getItem("userId");
    if (!uid) {
        router.push("/login");
        return;
    }

    // Llamamos a la API con el UID interno (no se ve en la URL del navegador)
    fetch(`/api/propiedades?uid=${uid}`)
      .then(res => res.json())
      .then(data => {
        setPropiedades(Array.isArray(data) ? data : []);
        setCargando(false);
      })
      .catch(() => setCargando(false));
  }, []);

  // 2. ENVIAR LOS DATOS AL SERVIDOR
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const uid = localStorage.getItem("userId");
    
    // Unimos los datos del formulario con el ID del dueño
    const payload = {
        ...Object.fromEntries(formData),
        ownerId: uid // Para que el backend sepa de quién es este nuevo inquilino
    };

    const res = await fetch("/api/inquilinos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      // REGRESAMOS A LA LISTA LIMPIA
      router.push("/inquilinos");
    } else {
      alert("Error al registrar inquilino. Verifica los datos.");
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 md:p-10 font-sans italic-none">
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-white w-full max-w-2xl rounded-[50px] shadow-2xl shadow-blue-100 overflow-hidden border border-slate-100"
      >
        {/* Cabecera Estilo Corporativo */}
        <div className="bg-slate-900 p-10 text-white relative text-center border-b-8 border-blue-600">
          <Link href="/inquilinos" className="absolute left-8 top-11 text-slate-500 hover:text-white transition-all hover:-translate-x-1">
            <ArrowLeft size={24} />
          </Link>
          <div className="inline-flex p-3 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/20">
            <UserPlus size={32} />
          </div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">Alta de Residente</h1>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2 italic">Registro en Bóveda CRM</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Nombre */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest italic">Identidad</label>
              <div className="relative group">
                <User className="absolute left-4 top-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input 
                  name="nombre" 
                  type="text" 
                  placeholder="Nombre completo" 
                  required
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-bold text-slate-700"
                />
              </div>
            </div>

            {/* Correo */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest italic">Contacto Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input 
                  name="correo" 
                  type="email" 
                  placeholder="correo@ejemplo.com" 
                  required
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-bold text-slate-700"
                />
              </div>
            </div>

            {/* Teléfono */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest italic">Línea WhatsApp</label>
              <div className="relative group">
                <Phone className="absolute left-4 top-4 text-slate-300 group-focus-within:text-green-500 transition-colors" size={18} />
                <input 
                  name="telefono" 
                  type="text" 
                  placeholder="52 1..." 
                  required
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-green-500/5 focus:border-green-500 transition-all font-bold text-slate-700"
                />
              </div>
            </div>

            {/* Vencimiento */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest italic">Término de Contrato</label>
              <div className="relative group">
                <Calendar className="absolute left-4 top-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input 
                  name="fechaFin" 
                  type="date" 
                  required
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-bold text-slate-700"
                />
              </div>
            </div>

            {/* Selector de Propiedad */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest italic">Asignación de Inmueble</label>
              <div className="relative group">
                <Home className="absolute left-4 top-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                <select 
                  name="propiedadId" 
                  required
                  className="w-full pl-12 pr-10 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none appearance-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-bold text-slate-700 cursor-pointer"
                >
                  <option value="">{cargando ? "Cargando tus casas..." : "Selecciona una propiedad..."}</option>
                  {propiedades.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.nombre.toUpperCase()} - ${p.precio.toLocaleString()}</option>
                  ))}
                </select>
              </div>
            </div>

          </div>

          {/* Footer del Formulario */}
          <div className="pt-6 border-t border-slate-50">
            <motion.button 
                whileHover={{ scale: 1.02, backgroundColor: "#2563eb" }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-blue-600 text-white py-5 rounded-[25px] font-black uppercase tracking-widest shadow-2xl shadow-blue-100 transition-all flex items-center justify-center gap-3 active:scale-95"
            >
                <Save size={20} /> Finalizar Registro
            </motion.button>
            <p className="text-center text-[9px] font-black text-slate-300 uppercase tracking-widest mt-6 flex items-center justify-center gap-2 italic">
                <ShieldCheck size={12} /> Datos protegidos por InmoGestion Security
            </p>
          </div>

        </form>
      </motion.div>

    </div>
  );
}