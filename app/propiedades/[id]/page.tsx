import { prisma } from "../../../lib/prisma";
import Link from "next/link";
import { 
  ArrowLeft, User, DollarSign, MapPin, Building2, 
  CheckCircle2, ShieldCheck, Zap, Star, Image as ImageIcon,
  Calendar, Info, ExternalLink,
  Users
} from "lucide-react";
import BotonReservar from "../../../components/BotonReservar";
import BotonIA from "@/components/BotonIA";

export default async function DetallePropiedad({ 
  params,
  searchParams
}: { 
  params: Promise<{ id: string }>,
  searchParams: Promise<{ uid?: string }>
}) {
  
  // 1. Resolvemos parámetros de URL e ID de usuario
  const { id } = await params;
  const { uid } = await searchParams;

  // 2. Identificamos al usuario que está mirando la página
  const usuarioMirando = await prisma.usuario.findUnique({
    where: { id: uid || "invitado" }
  });

  const role = usuarioMirando?.rol || "INQUILINO";
  const isAdmin = role === "ADMIN";
  const isOwner = role === "PROPIETARIO";

  // 3. Traemos la propiedad con su galería de fotos, inquilinos y pagos
  const propiedad = await prisma.propiedad.findUnique({
    where: { id: id },
    include: {
      inquilinos: {
        include: { pagos: true }
      }
    }
  }) as any;

  if (!propiedad) return (
    <div className="p-20 text-center flex flex-col items-center gap-4 font-sans">
      <p className="font-black text-slate-400 text-2xl tracking-tighter italic uppercase">Propiedad no localizada</p>
      <Link href={`/propiedades?uid=${uid}`} className="text-blue-600 font-bold hover:underline">Regresar al Inventario</Link>
    </div>
  );

  // Lógica para calcular ingresos totales de esta propiedad específica
  const totalGenerado = propiedad.inquilinos.reduce(
    (acc: number, i: any) => acc + i.pagos.reduce((accP: number, p: any) => accP + p.monto, 0), 
    0
  );

  return (
    <div className="p-4 md:p-10 bg-[#f8fafc] min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* NAVEGACIÓN SUPERIOR */}
        <Link href={`/propiedades?uid=${uid}`} className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 font-black text-[10px] uppercase tracking-widest mb-10 transition">
          <ArrowLeft size={16} /> Volver al Inventario
        </Link>

        {/* --- SECCIÓN 1: CABECERA PREMIUM --- */}
        <div className="bg-white p-10 rounded-[60px] shadow-2xl shadow-blue-100 border border-slate-100 mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
               <span className="bg-slate-900 text-white p-4 rounded-[22px] shadow-xl"><Building2 size={28}/></span>
               <div>
                  <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">{propiedad.nombre}</h1>
                  <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg mt-3 inline-block uppercase tracking-widest italic border border-blue-100">Expediente Verificado</span>
               </div>
            </div>
            <p className="flex items-center gap-2 text-slate-400 font-bold text-sm tracking-tight italic">
              <MapPin size={18} className="text-red-500" /> {propiedad.direccion}
            </p>
          </div>
          
          <div className="text-right bg-slate-900 text-white p-8 rounded-[40px] shadow-2xl border-b-8 border-blue-600 relative z-10 min-w-[250px]">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2 italic">Renta Mensual</p>
            <p className="text-5xl font-black text-blue-400 tracking-tighter italic">${propiedad.precio.toLocaleString()}</p>
          </div>
        </div>

        {/* --- SECCIÓN 2: GALERÍA DE FOTOS REAL --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* Foto Principal */}
            <div className="h-[500px] rounded-[60px] overflow-hidden border-4 border-white shadow-2xl relative group">
                <img 
                    src={propiedad.fotos?.[0] || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1000&auto=format&fit=crop"} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    alt="main view" 
                />
                <div className="absolute top-6 left-6 bg-slate-900/60 backdrop-blur-md text-white px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                    <ImageIcon size={14}/> Vista Principal
                </div>
            </div>

            {/* Grid de Fotos Secundarias */}
            <div className="grid grid-cols-2 gap-6 h-[500px]">
                {propiedad.fotos?.slice(1, 5).map((url: string, idx: number) => (
                    <div key={idx} className="rounded-[40px] overflow-hidden border-4 border-white shadow-xl group">
                        <img src={url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="unit view" />
                    </div>
                ))}
                {/* Cuadro de relleno si no hay fotos */}
                {(!propiedad.fotos || propiedad.fotos.length <= 1) && (
                    <div className="col-span-2 bg-slate-100 rounded-[40px] flex flex-col items-center justify-center text-slate-300 border-2 border-dashed gap-4">
                        <ImageIcon size={48} />
                        <p className="font-black uppercase text-[10px] tracking-widest italic">Sin más imágenes registradas</p>
                    </div>
                )}
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          <div className="lg:col-span-2 space-y-10">
            
            {/* MAPA DE UBICACIÓN */}
            <div className="bg-white p-5 rounded-[60px] shadow-sm border border-slate-100 h-[450px] overflow-hidden relative group">
                <iframe 
                    width="100%" 
                    height="100%" 
                    className="rounded-[45px] grayscale group-hover:grayscale-0 transition-all duration-1000"
                    frameBorder="0" 
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(propiedad.direccion)}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
                ></iframe>
                <div className="absolute bottom-8 left-10 right-10 bg-slate-900/90 backdrop-blur-xl p-6 rounded-[30px] border border-white/10 text-white flex justify-between items-center shadow-2xl">
                    <div>
                        <p className="text-[9px] font-black uppercase text-blue-400 tracking-widest mb-1 italic">Coordenadas de la unidad</p>
                        <p className="text-sm font-bold truncate w-64 uppercase">{propiedad.direccion}</p>
                    </div>
                    <MapPin size={24} className="text-red-500" />
                </div>
            </div>

            {/* SECCIÓN GESTIÓN (DUEÑO O ADMIN) */}
            {(isOwner || isAdmin) && (
                <div className="space-y-8">
                    <div className="flex items-center gap-4 px-6">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] italic italic">Control de Ocupantes</h3>
                        <div className="h-px bg-slate-200 flex-1"></div>
                    </div>
                    
                    {propiedad.inquilinos.length === 0 ? (
                        <div className="bg-white p-20 rounded-[60px] border-2 border-dashed border-slate-100 text-center">
                            <Users size={40} className="mx-auto text-slate-200 mb-4" />
                            <p className="text-slate-300 font-black italic uppercase text-xs tracking-widest">Unidad disponible en Marketplace</p>
                        </div>
                    ) : (
                        propiedad.inquilinos.map((i: any) => (
                            <div key={i.id} className="bg-white p-10 rounded-[55px] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group border-l-[12px] border-l-blue-600">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                                    <div className="flex items-center gap-5">
                                        <div className="w-16 h-16 bg-slate-50 rounded-[28px] flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner"><User size={28} /></div>
                                        <div>
                                            <h4 className="text-2xl font-black text-slate-800 tracking-tighter uppercase italic">{i.nombre}</h4>
                                            <p className="text-slate-400 font-bold text-xs">{i.correo}</p>
                                        </div>
                                    </div>
                                    <Link href={`/inquilinos/${i.id}?uid=${uid}`} className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-blue-600 transition-colors italic">
                                        Ficha CRM <ExternalLink size={14} />
                                    </Link>
                                </div>
                                
                                <div className="space-y-4">
                                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] italic mb-2">Últimos Pagos Registrados</p>
                                    {i.pagos.slice(0,3).map((p: any) => (
                                        <div key={p.id} className="flex justify-between items-center p-6 bg-slate-50 rounded-[30px] border border-transparent hover:border-slate-200 transition-all">
                                            <span className="font-black text-slate-700 text-xs uppercase italic tracking-tighter">{p.mesPagado}</span>
                                            <span className="font-black text-slate-900 text-2xl tracking-tighter italic">${p.monto.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* SECCIÓN INQUILINO: BOTÓN DE RESERVA */}
            {role === "INQUILINO" && (
                <div className="bg-slate-900 p-12 rounded-[60px] text-white shadow-2xl relative overflow-hidden group">
                    <div className="relative z-10 text-center">
                        <div className="bg-blue-600 w-24 h-24 rounded-[35px] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-blue-500/30 group-hover:scale-110 transition-transform duration-500 italic font-black text-3xl">
                            🏠
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase mb-4 leading-none italic">¿Quieres mudarte aquí?</h2>
                        <p className="text-slate-400 font-medium mb-12 max-w-sm mx-auto text-lg leading-relaxed italic">Al reservar, el propietario recibirá tu interés y generará tu contrato digital de inmediato.</p>
                        
                        <BotonReservar propiedadId={id} />
                        
                    </div>
                    <div className="absolute -right-20 -bottom-20 text-[300px] font-black italic opacity-[0.03] select-none pointer-events-none">HOME</div>
                </div>
            )}
          </div>

          {/* --- COLUMNA DERECHA: ANALÍTICA (DUEÑO) O SERVICIOS (INQUILINO) --- */}
          <div className="space-y-8">
             <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] px-4 italic italic">Estado Patrimonial</h3>
             
             {(isOwner || isAdmin) ? (
                <div className="bg-blue-600 text-white p-10 rounded-[60px] shadow-2xl relative overflow-hidden group border-b-[15px] border-indigo-900 transition-all duration-500">
                    <p className="text-blue-200 text-[10px] font-black uppercase tracking-widest mb-4 italic italic">Utilidad Neta de la Unidad</p>
                    <h2 className="text-6xl font-black mb-10 tracking-tighter italic group-hover:scale-105 transition-transform italic">
                        ${totalGenerado.toLocaleString()}
                    </h2>
                    <div className="space-y-5 border-t border-blue-500/30 pt-10">
                        <div className="flex justify-between items-center">
                            <span className="text-blue-100 text-[9px] font-black uppercase tracking-tighter italic">Ocupación</span>
                            <span className="bg-white text-blue-600 px-3 py-1 rounded-lg text-xs font-black italic italic uppercase tracking-tighter">Activa</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-blue-100 text-[9px] font-black uppercase tracking-tighter italic">Salud de Cuenta</span>
                            <span className="text-green-300 font-black text-xs uppercase italic italic tracking-tighter flex items-center gap-1">
                                <CheckCircle2 size={12}/> Estable
                            </span>
                        </div>
                    </div>
                    <ShieldCheck size={200} className="absolute -right-20 -bottom-20 opacity-10 group-hover:rotate-45 transition-transform duration-1000" />
                </div>
             ) : (
                <div className="bg-white p-12 rounded-[60px] border border-slate-100 shadow-sm text-center flex flex-col items-center">
                    <Info size={40} className="text-blue-500 mb-6" />
                    <p className="text-slate-300 font-black uppercase text-[10px] tracking-widest italic mb-10">Detalles del Inmueble</p>
                    <div className="grid grid-cols-2 gap-5 w-full">
                        {['WiFi Alta Vel.', 'Luz Incluida', 'Vigilancia', 'Agua 24/7'].map(s => (
                            <div key={s} className="bg-slate-50 p-4 rounded-3xl flex flex-col items-center gap-2 border border-slate-100">
                                <CheckCircle2 size={16} className="text-green-500" />
                                <span className="text-[9px] font-black uppercase text-slate-800 tracking-tighter">{s}</span>
                            </div>
                        ))}
                    </div>
                </div>
             )}

             <div className="bg-slate-900 p-8 rounded-[50px] text-white shadow-xl relative overflow-hidden group">
                <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-2 italic italic">Asistente IA</p>
                <h4 className="text-xl font-black tracking-tight italic italic mb-1">InmoBot <span className="text-blue-500 tracking-normal text-xs">v2.1</span></h4>
                <p className="text-slate-400 text-xs font-medium italic opacity-70 mb-6 tracking-tight">Pregúntame sobre el rendimiento de esta casa.</p>
                <div className="relative z-10 scale-90 -translate-x-4">
                    <BotonIA />
                </div>
                <Zap size={100} className="absolute -right-8 -bottom-8 opacity-5 text-blue-500 group-hover:scale-110 transition-transform" />
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}