import { prisma } from "../../../lib/prisma";
import Link from "next/link";
import { 
  ArrowLeft, User, DollarSign, MapPin, Building2, 
  CheckCircle2, ShieldCheck, Zap, Star, Image as ImageIcon,
  Calendar, Info, ExternalLink, Users
} from "lucide-react";
import BotonReservar from "../../../components/BotonReservar";
import BotonIA from "@/components/BotonIA";
import CarruselPremium from "../../../components/CarruselPremium";
import * as motion from "framer-motion/client";
import { cookies } from "next/headers"; // <--- VITAL PARA URLS LIMPIAS
import { redirect } from "next/navigation";

export default async function DetallePropiedad({ 
  params 
}: { 
  params: Promise<{ id: string }>
}) {
  
  // 1. RESOLVEMOS IDENTIDAD DESDE COOKIES
  const { id } = await params;
  const cookieStore = await cookies();
  const uid = cookieStore.get("userId")?.value;

  if (!uid) redirect("/login");

  // 2. IDENTIFICAMOS AL USUARIO Y SU ROL
  const usuarioMirando = await prisma.usuario.findUnique({
    where: { id: uid }
  });

  const role = usuarioMirando?.rol || "INQUILINO";
  const isAdmin = role === "ADMIN";
  const isOwner = role === "PROPIETARIO";
  const isTenant = role === "INQUILINO";

  // 3. TRAEMOS LA PROPIEDAD CON SUS RELACIONES
  const propiedad = await prisma.propiedad.findUnique({
    where: { id: id },
    include: {
      inquilinos: {
        include: { pagos: true }
      }
    }
  }) as any;

  if (!propiedad) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-900 text-white font-sans">
      <h1 className="text-4xl font-black uppercase italic italic">Unidad no localizada</h1>
      <Link href="/propiedades" className="mt-6 bg-blue-600 px-8 py-3 rounded-2xl font-black text-xs uppercase">Regresar al Inventario</Link>
    </div>
  );

  // Cálculo de rendimiento para dueños/admins
  const totalGenerado = propiedad.inquilinos.reduce(
    (acc: number, i: any) => acc + i.pagos.reduce((accP: number, p: any) => accP + p.monto, 0), 
    0
  );

  return (
    <div className="p-4 md:p-10 bg-[#f8fafc] min-h-screen font-sans italic-none text-slate-900">
      <div className="max-w-7xl mx-auto">
        
        {/* NAVEGACIÓN LIMPIA */}
        <Link href="/propiedades" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 font-black text-[10px] uppercase tracking-widest mb-10 transition italic hover:-translate-x-2">
          <ArrowLeft size={16} /> Volver al Inventario
        </Link>

        {/* --- CABECERA PREMIUM ANIMADA --- */}
        <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }}
            className="bg-white p-10 rounded-[60px] shadow-2xl shadow-blue-100 border border-slate-100 mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative overflow-hidden"
        >
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
               <span className="bg-slate-900 text-white p-4 rounded-[22px] shadow-xl"><Building2 size={28}/></span>
               <div>
                  <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase italic italic">{propiedad.nombre}</h1>
                  <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg mt-3 inline-block uppercase italic border border-blue-100">Expediente Verificado</span>
               </div>
            </div>
            <p className="flex items-center gap-2 text-slate-400 font-bold text-sm italic tracking-tight italic"><MapPin size={18} className="text-red-500" /> {propiedad.direccion}</p>
          </div>
          <div className="text-right bg-slate-900 text-white p-8 rounded-[40px] shadow-2xl border-b-8 border-blue-600 relative z-10 min-w-[250px]">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2 italic italic">Renta Mensual</p>
            <h2 className="text-5xl font-black text-blue-400 tracking-tighter italic italic italic italic italic">${propiedad.precio.toLocaleString()}</h2>
          </div>
        </motion.div>

        {/* --- CARRUSEL DE IMÁGENES (Requisito Unidad II) --- */}
        <div className="mb-12">
            <CarruselPremium fotos={propiedad.fotos || []} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            {/* MAPA DINÁMICO */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                whileInView={{ opacity: 1, scale: 1 }} 
                viewport={{ once: true }} 
                className="bg-white p-5 rounded-[60px] shadow-sm border border-slate-100 h-[450px] overflow-hidden group relative"
            >
                <iframe width="100%" height="100%" className="rounded-[45px] grayscale group-hover:grayscale-0 transition-all duration-1000 shadow-inner" frameBorder="0" src={`https://maps.google.com/maps?q=${encodeURIComponent(propiedad.direccion)}&t=&z=16&ie=UTF8&iwloc=&output=embed`}></iframe>
                <div className="absolute bottom-10 left-10 right-10 bg-slate-900/80 backdrop-blur-lg p-6 rounded-[30px] border border-white/10 text-white italic font-bold text-xs uppercase tracking-widest text-center italic">Localización GPS Autorizada</div>
            </motion.div>

            {/* GESTIÓN DUEÑO O ADMIN */}
            {(isOwner || isAdmin) && (
                <div className="space-y-8">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] italic px-6 italic italic">Registro de Ocupantes</h3>
                    {propiedad.inquilinos.length === 0 ? (
                        <div className="bg-white p-20 rounded-[60px] border-2 border-dashed border-slate-100 text-center italic text-slate-300 font-bold uppercase text-[10px] italic">Sin residentes vinculados</div>
                    ) : (
                        propiedad.inquilinos.map((i: any) => (
                            <div key={i.id} className="bg-white p-10 rounded-[55px] border border-slate-100 shadow-sm hover:shadow-2xl transition-all border-l-[12px] border-l-blue-600 mb-6">
                                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 shadow-inner"><User size={28} /></div>
                                        <div>
                                            <h4 className="text-2xl font-black text-slate-800 tracking-tighter uppercase italic italic">{i.nombre}</h4>
                                            <p className="text-slate-400 font-bold text-xs">{i.correo}</p>
                                        </div>
                                    </div>
                                    <Link href={`/inquilinos/${i.id}`} className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-colors shadow-xl italic">Expediente CRM</Link>
                                </div>
                                <div className="space-y-4">
                                    {i.pagos.slice(0,3).map((p: any) => (
                                        <div key={p.id} className="flex justify-between items-center p-6 bg-slate-50 rounded-[30px] border border-transparent hover:border-slate-100 transition-all">
                                            <span className="font-black text-slate-700 text-xs uppercase italic italic italic">{p.mesPagado}</span>
                                            <span className="font-black text-slate-900 text-2xl tracking-tighter italic italic italic">${p.monto.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* VISTA PARA INQUILINO (MARKETPLACE) */}
            {isTenant && (
                <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-slate-900 p-12 rounded-[60px] text-white shadow-2xl relative overflow-hidden group text-center border-b-8 border-blue-600">
                    <div className="relative z-10">
                        <div className="bg-blue-600 w-24 h-24 rounded-[35px] flex items-center justify-center mx-auto mb-8 shadow-xl font-black text-3xl">🏠</div>
                        <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase mb-4 leading-none italic italic">¿Quieres mudarte aquí?</h2>
                        <p className="text-slate-400 font-medium mb-12 max-w-sm mx-auto text-lg leading-relaxed italic italic">Al realizar el primer pago o reservar, el sistema vinculará tu cuenta automáticamente a esta unidad.</p>
                        <BotonReservar propiedadId={id} />
                    </div>
                    <Zap size={250} className="absolute -right-20 -bottom-20 opacity-5" />
                </motion.div>
            )}
          </div>

          {/* BARRA LATERAL DERECHA */}
          <div className="space-y-8">
             {(isOwner || isAdmin) ? (
                <div className="bg-blue-600 text-white p-10 rounded-[60px] shadow-2xl border-b-[15px] border-indigo-900 group">
                    <p className="text-blue-200 text-[10px] font-black uppercase tracking-widest mb-4 italic italic">Utilidad Neta Generada</p>
                    <h2 className="text-6xl font-black mb-10 tracking-tighter italic italic italic group-hover:scale-105 transition-transform italic italic">${totalGenerado.toLocaleString()}</h2>
                    <div className="space-y-5 border-t border-blue-500/30 pt-10">
                        <div className="flex justify-between items-center italic font-black text-[10px] uppercase italic"><span>Ocupación</span><span className="bg-white text-blue-600 px-3 py-1 rounded-lg">ACTIVA</span></div>
                    </div>
                    <ShieldCheck size={200} className="absolute -right-20 -bottom-20 opacity-10" />
                </div>
             ) : (
                <div className="bg-white p-12 rounded-[60px] border border-slate-100 shadow-sm text-center italic font-black uppercase text-[10px] tracking-widest italic italic">Servicios Incluidos</div>
             )}

             <div className="bg-slate-900 p-10 rounded-[60px] text-white shadow-xl relative overflow-hidden group">
                <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-4 italic italic italic italic">Asistente IA</p>
                <div className="relative z-10 scale-90 -translate-x-4"><BotonIA /></div>
                <Zap size={150} className="absolute -right-12 -bottom-12 opacity-5 text-blue-500 group-hover:rotate-12 transition-transform duration-700" />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}