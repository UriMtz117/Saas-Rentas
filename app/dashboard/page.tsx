import { prisma } from "../../lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  Home, Users, CreditCard, TrendingUp, 
  ShieldCheck, Zap, ArrowRight, UserCircle, MapPin, Building2, Plus, FileText, PenTool, CheckCircle2, AlertCircle
} from "lucide-react";
import BotonIA from "../../components/BotonIA";
import SubidaDocumentos from "../../components/SubidaDocumentos";
import ListaDocumentos from "../../components/ListaDocumentos";

export default async function DashboardPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ uid?: string }> 
}) {
  const params = await searchParams;
  const uid = params.uid;

  // 1. SEGURIDAD: Redirección si no hay sesión activa
  if (!uid) redirect("/login");

  // 2. CONSULTA INTEGRAL DEL USUARIO (Traemos perfil, casa y contrato)
  const user = await prisma.usuario.findUnique({ 
    where: { id: uid },
    include: { 
        perfilRenta: { 
            include: { 
              propiedad: true,
              contrato: true // VITAL: Traemos la info del contrato para ver si ya firmó
            } 
        } 
    } 
  }) as any;
  
  if (!user) redirect("/login");

  const role = user.rol;
  const isAdmin = role === "ADMIN";

  // 3. CONSULTAS FILTRADAS POR PRIVACIDAD (Para Propietarios y Admins)
  const totalPropiedades = await prisma.propiedad.count({ 
    where: isAdmin ? {} : { usuarioId: uid } 
  });
  
  const totalInquilinos = await prisma.inquilino.count({ 
    where: isAdmin ? {} : { propiedad: { usuarioId: uid } } 
  });
  
  const ingresosData = await prisma.pago.aggregate({
    _sum: { monto: true },
    where: { 
        estado: "PAGADO", 
        inquilino: isAdmin ? {} : { propiedad: { usuarioId: uid } } 
    }
  });

  const ultimosPagos = await prisma.pago.findMany({
    take: 4,
    where: isAdmin ? {} : { inquilino: { propiedad: { usuarioId: uid } } },
    include: { inquilino: { include: { propiedad: true } } },
    orderBy: { fechaPago: 'desc' }
  }) as any;

  const montoTotal = ingresosData._sum?.monto || 0;

  // 4. LÓGICA DE CHECKLIST LEGAL PARA INQUILINOS
  const requisitos = [
    "IDENTIFICACIÓN OFICIAL",
    "COMPROBANTE DE DOMICILIO",
    "COMPROBANTE DE INGRESOS"
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-10 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        
        {/* ========================================================
           VISTA A: EL USUARIO ES UN INQUILINO (Residente)
           ======================================================== */}
        {role === "INQUILINO" ? (
          <div className="space-y-10">
            {/* Cabecera Inquilino */}
            <div className="bg-white p-10 rounded-[50px] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-6 text-center md:text-left">
                    <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20 italic font-black text-2xl">
                        {user.nombre?.charAt(0)}
                    </div>
                    <div>
                        <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none italic">Mi Expediente</h1>
                        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] mt-2 italic">Residente: {user.nombre}</p>
                    </div>
                </div>
                <Link href={`/explorar?uid=${uid}`} className="bg-slate-900 text-white px-10 py-5 rounded-[25px] font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center gap-3 group">
                    Explorar Rentas <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform"/>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Columna Izquierda: Hogar y Contratos */}
                <div className="lg:col-span-2 space-y-10">
                    
                    {/* AVISO DE CONTRATO PENDIENTE O FIRMADO */}
                    {user.perfilRenta?.contrato && (
                      <div className={`p-8 rounded-[45px] text-white shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6 ${user.perfilRenta.contrato.firmado ? 'bg-slate-900 border-b-[10px] border-green-500' : 'bg-blue-600 border-b-[10px] border-blue-800'}`}>
                          <div className="flex items-center gap-6">
                              <div className="bg-white/10 p-4 rounded-3xl"><FileText size={32} /></div>
                              <div>
                                  <h3 className="text-2xl font-black italic uppercase tracking-tighter">
                                    {user.perfilRenta.contrato.firmado ? "Contrato Legalizado" : "Firma Pendiente"}
                                  </h3>
                                  <p className="text-white/60 text-xs font-bold uppercase tracking-widest italic mt-1">
                                    {user.perfilRenta.contrato.firmado ? "Documento con validez digital activa" : "Tu propietario ha enviado el acuerdo legal"}
                                  </p>
                              </div>
                          </div>
                          <Link 
                            href={user.perfilRenta.contrato.firmado ? `/contratos/ver/${user.perfilRenta.contrato.id}?uid=${uid}` : `/contratos/firmar/${user.perfilRenta.contrato.id}?uid=${uid}`}
                            className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all shadow-xl"
                          >
                              {user.perfilRenta.contrato.firmado ? "Ver Contrato" : "Revisar y Firmar 🖋️"}
                          </Link>
                      </div>
                    )}

                    <div className="bg-slate-900 text-white p-12 rounded-[60px] shadow-2xl relative overflow-hidden group">
                        <h2 className="text-2xl font-black italic mb-8 uppercase tracking-tight text-blue-400 italic">Hogar Actual</h2>
                        {user.perfilRenta?.propiedad ? (
                            <div className="space-y-6">
                                <div>
                                    <p className="text-4xl font-black text-blue-500 italic uppercase tracking-tighter italic">{user.perfilRenta.propiedad.nombre}</p>
                                    <p className="text-slate-400 flex items-center gap-2 font-medium mt-2 italic tracking-tight"><MapPin size={18} className="text-red-500" /> {user.perfilRenta.propiedad.direccion}</p>
                                </div>
                                <div className="h-64 w-full rounded-[40px] overflow-hidden border border-white/10 grayscale hover:grayscale-0 transition-all duration-1000">
                                    <iframe width="100%" height="100%" frameBorder="0" src={`https://maps.google.com/maps?q=${encodeURIComponent(user.perfilRenta.propiedad.direccion)}&t=&z=16&ie=UTF8&iwloc=&output=embed`}></iframe>
                                </div>
                            </div>
                        ) : <p className="text-slate-500 font-bold italic py-10 uppercase italic tracking-widest opacity-50 text-center">Sin unidad asignada actualmente</p>}
                    </div>

                    <div className="bg-white p-12 rounded-[60px] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center group hover:shadow-xl transition-all">
                        <div className="flex items-center gap-6">
                            <div className="bg-green-50 p-6 rounded-3xl text-green-600 shadow-inner group-hover:bg-green-600 group-hover:text-white transition-colors"><CreditCard size={32} /></div>
                            <div>
                                <h3 className="font-black text-slate-800 text-xl uppercase italic tracking-tighter italic">Mis Finanzas</h3>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1 italic">Gestión de recibos digitales</p>
                            </div>
                        </div>
                        <Link href={`/pagos?uid=${uid}`} className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all">Ver Movimientos</Link>
                    </div>
                </div>

                {/* Columna Derecha: Estatus Documental */}
                <div className="space-y-8">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-4 italic italic uppercase">Checklist Legal</h3>
                    
                    {user.perfilRenta && <SubidaDocumentos inquilinoId={user.perfilRenta.id} />}
                    
                    <div className="bg-slate-900 p-10 rounded-[55px] text-white shadow-2xl relative overflow-hidden border-b-[12px] border-blue-600">
                        <div className="relative z-10">
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-8 italic">Validación de Expediente</p>
                            
                            <div className="space-y-8">
                                {requisitos.map((req) => {
                                    const docCargado = (user.perfilRenta?.documentos as any[])?.find(d => d.nombre === req);
                                    return (
                                        <div key={req} className="flex items-center justify-between group">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${docCargado ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'bg-white/5 text-slate-700 border border-white/5'}`}>
                                                    {docCargado ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className={`text-[10px] font-black uppercase tracking-tighter ${docCargado ? 'text-white' : 'text-slate-500'}`}>{req}</span>
                                                    {docCargado ? (
                                                        <a href={docCargado.url} target="_blank" className="text-[8px] text-blue-400 font-bold hover:underline mt-1 italic tracking-widest">VER ARCHIVO →</a>
                                                    ) : (
                                                        <span className="text-[8px] text-red-500/60 font-black uppercase mt-1 italic animate-pulse tracking-widest">Pendiente</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <ShieldCheck size={180} className="absolute -right-16 -bottom-16 opacity-5 pointer-events-none" />
                    </div>

                    {user.perfilRenta && <ListaDocumentos documentos={user.perfilRenta.documentos} inquilinoId={user.perfilRenta.id} />}
                </div>
            </div>
          </div>
        ) : (
          /* ========================================================
             VISTA B: EL USUARIO ES PROPIETARIO O ADMIN
             ======================================================== */
          <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                <div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic leading-none italic">{isAdmin ? "Consola SaaS" : "Mi Patrimonio"}</h1>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-2 flex items-center gap-2 italic">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse inline-block"></span>
                        Estado Operativo Activo
                    </p>
                </div>
                <Link href={`/propiedades/nueva?uid=${uid}`} className="bg-blue-600 text-white px-8 py-4 rounded-[22px] font-black text-[10px] uppercase flex items-center gap-2 shadow-xl hover:bg-slate-900 transition-all active:scale-95 shadow-blue-100 italic tracking-widest"><Plus size={16}/> Registrar Propiedad</Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                <div className="bg-white p-10 rounded-[50px] shadow-sm border border-slate-100 hover:shadow-xl transition-all group relative overflow-hidden">
                    <p className="text-slate-400 text-[10px] font-black uppercase mb-1 tracking-widest italic">Ingresos Netos</p>
                    <h2 className="text-5xl font-black tracking-tighter italic text-green-600 italic">${montoTotal.toLocaleString()}</h2>
                    <TrendingUp className="absolute -right-4 -bottom-4 opacity-[0.03] text-slate-900" size={100} />
                </div>
                <div className="bg-white p-10 rounded-[50px] shadow-sm border border-slate-100 hover:shadow-xl transition-all group relative overflow-hidden">
                    <p className="text-slate-400 text-[10px] font-black uppercase mb-1 tracking-widest italic">Unidades en Red</p>
                    <h2 className="text-5xl font-black tracking-tighter italic text-blue-600 italic">{totalPropiedades}</h2>
                    <Home className="absolute -right-4 -bottom-4 opacity-[0.03] text-slate-900" size={100} />
                </div>
                <div className="bg-slate-900 text-white p-10 rounded-[50px] shadow-2xl relative overflow-hidden group">
                    <p className="text-slate-500 text-[10px] font-black uppercase mb-1 tracking-widest italic">Inquilinos Totales</p>
                    <h2 className="text-5xl font-black tracking-tighter italic italic">{totalInquilinos}</h2>
                    <Users className="absolute -right-4 -bottom-4 opacity-[0.05]" size={150} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                <div className="lg:col-span-3 bg-white p-12 rounded-[60px] shadow-sm border border-slate-100 overflow-hidden relative">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight italic uppercase flex items-center gap-3 italic italic italic"><CreditCard size={24} className="text-blue-600" /> Cobranza</h3>
                        <Link href={`/pagos?uid=${uid}`} className="text-[10px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-widest transition italic">Historial Completo →</Link>
                    </div>
                    <div className="space-y-4">
                        {ultimosPagos.map((pago: any) => (
                            <div key={pago.id} className="flex justify-between items-center p-6 bg-slate-50 rounded-[35px] hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-slate-100 group">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-amber-400 shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-all"><Zap size={22} fill="currentColor" /></div>
                                    <div><p className="font-black text-slate-800 text-lg uppercase tracking-tighter italic italic italic">{pago.inquilino.nombre}</p><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic italic">{pago.mesPagado}</p></div>
                                </div>
                                <p className="font-black text-slate-900 text-2xl tracking-tighter italic italic italic">${pago.monto.toLocaleString()}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-900 p-12 rounded-[60px] text-white shadow-2xl relative overflow-hidden group h-full flex flex-col justify-center">
                        <h2 className="text-4xl font-black italic tracking-tighter mb-4 uppercase leading-none italic italic italic">Asistente IA</h2>
                        <p className="text-blue-100 mb-10 text-sm font-medium opacity-80 italic tracking-wide max-w-xs">Análisis financiero predictivo con Gemini AI.</p>
                        <BotonIA />
                        <Zap size={200} className="absolute -right-12 -bottom-12 opacity-10 group-hover:rotate-12 transition-all duration-700" />
                    </div>

                    <div className="bg-white p-10 rounded-[60px] border border-slate-100 shadow-sm relative group overflow-hidden transition-all hover:border-blue-200">
                        <div className="flex justify-between items-start mb-6">
                            <div className="bg-slate-900 text-white p-4 rounded-2xl group-hover:bg-blue-600 transition-colors shadow-xl shadow-slate-200"><FileText size={24}/></div>
                            <Link href={`/contratos/nuevo?uid=${uid}`} className="bg-slate-50 p-2 rounded-xl text-slate-400 hover:text-blue-600 transition-colors"><PenTool size={18}/></Link>
                        </div>
                        <h3 className="text-xl font-black text-slate-900 italic uppercase italic italic tracking-tighter leading-none">Generador Legal</h3>
                        <Link href={`/contratos/nuevo?uid=${uid}`} className="text-blue-600 font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 group-hover:gap-4 transition-all italic mt-4 inline-block italic">
                            Redactar Documento <ArrowRight size={14}/>
                        </Link>
                    </div>
                </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}