import { prisma } from "../../../lib/prisma";
import Link from "next/link";
import { 
  ArrowLeft, User, DollarSign, MapPin, Building2, 
  CheckCircle2, ShieldCheck, Zap, Star, Image as ImageIcon,
  Calendar, Info, ExternalLink, Users
} from "lucide-react";
import BotonReservar from "../../../components/BotonReservar";
import BotonIA from "@/components/BotonIA";
import CarruselPremium from "../../../components/CarruselPremium"; // REQUERIMIENTO CARRUSEL
import * as motion from "framer-motion/client"; // REQUERIMIENTO SCROLL

export default async function DetallePropiedad({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ uid?: string }> }) {
  const { id } = await params;
  const { uid } = await searchParams;

  const user = await prisma.usuario.findUnique({ where: { id: uid || "no" } });
  const isTenant = user?.rol === "INQUILINO";
  const isOwner = user?.rol === "PROPIETARIO" || user?.rol === "ADMIN";

  const propiedad = await prisma.propiedad.findUnique({
    where: { id: id },
    include: { inquilinos: { include: { pagos: true } } }
  }) as any;

  if (!propiedad) return <div className="h-screen flex items-center justify-center font-black uppercase tracking-widest text-slate-300 italic italic italic">Unidad no localizada</div>;

  return (
    <div className="p-4 md:p-10 bg-[#f8fafc] min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        
        <Link href={`/propiedades?uid=${uid}`} className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 font-black text-[10px] uppercase mb-10 transition italic hover:-translate-x-2">
          <ArrowLeft size={16} /> Volver al Inventario
        </Link>

        {/* --- REQUERIMIENTO: EVENTO DE SCROLL (REVEAL HEADER) --- */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-white p-10 rounded-[60px] shadow-2xl mb-10 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
          <div className="relative z-10 text-center md:text-left">
             <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase italic italic italic">{propiedad.nombre}</h1>
             <p className="flex items-center justify-center md:justify-start gap-2 text-slate-400 font-bold text-sm mt-4 italic"><MapPin size={18} className="text-red-500" /> {propiedad.direccion}</p>
          </div>
          <div className="text-right bg-slate-900 text-white p-8 rounded-[40px] shadow-2xl border-b-8 border-blue-600 relative z-10 min-w-[250px] italic italic italic italic">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2 italic italic italic">Renta Mensual</p>
            <p className="text-5xl font-black text-blue-400 tracking-tighter">${propiedad.precio.toLocaleString()}</p>
          </div>
        </motion.div>

        {/* --- REQUERIMIENTO: CARRUSEL DE IMÁGENES --- */}
        <div className="mb-12">
            <CarruselPremium fotos={propiedad.fotos || []} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            {/* MAPA DINÁMICO */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="bg-white p-5 rounded-[60px] shadow-sm border border-slate-100 h-[450px] overflow-hidden group relative">
                <iframe width="100%" height="100%" className="rounded-[45px] grayscale group-hover:grayscale-0 transition-all duration-1000 shadow-inner" frameBorder="0" src={`https://maps.google.com/maps?q=${encodeURIComponent(propiedad.direccion)}&t=&z=16&ie=UTF8&iwloc=&output=embed`}></iframe>
            </motion.div>

            {/* REQUERIMIENTO: MOSTRAR/OCULTAR (Vistas por Rol) */}
            {isOwner && (
                <div className="space-y-8">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] italic italic px-6">Directorio de Ocupantes</h3>
                    {propiedad.inquilinos.map((i: any) => (
                        <div key={i.id} className="bg-white p-10 rounded-[55px] border border-slate-100 shadow-sm hover:shadow-2xl transition-all border-l-[12px] border-l-blue-600 mb-6">
                            <div className="flex justify-between items-center mb-10 flex-col md:flex-row gap-6">
                                <div className="flex items-center gap-5"><div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 shadow-inner"><User size={28} /></div><div><h4 className="text-2xl font-black text-slate-800 tracking-tighter uppercase italic italic italic italic italic">{i.nombre}</h4><p className="text-slate-400 font-bold text-xs">{i.correo}</p></div></div>
                                <Link href={`/inquilinos/${i.id}?uid=${uid}`} className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-colors italic italic shadow-xl">Ver Expediente</Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isTenant && (
                <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-slate-900 p-12 rounded-[60px] text-white shadow-2xl relative overflow-hidden group text-center">
                    <div className="relative z-10">
                        <div className="bg-blue-600 w-24 h-24 rounded-[35px] flex items-center justify-center mx-auto mb-8 shadow-xl font-black text-3xl">🏠</div>
                        <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase mb-4 leading-none italic italic italic italic">¿Te gusta este lugar?</h2>
                        <BotonReservar propiedadId={id} />
                    </div>
                    <Zap size={250} className="absolute -right-20 -bottom-20 opacity-5" />
                </motion.div>
            )}
          </div>

          <div className="space-y-8">
             <div className="bg-slate-900 p-10 rounded-[60px] text-white shadow-xl relative overflow-hidden">
                <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-4 italic">Asistente IA</p>
                <div className="relative z-10 scale-90 -translate-x-4"><BotonIA /></div>
                <Zap size={100} className="absolute -right-8 -bottom-8 opacity-5 text-blue-500" />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}