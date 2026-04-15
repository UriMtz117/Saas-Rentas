import { prisma } from "../../../lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { 
  ArrowLeft, User, Phone, Mail, CreditCard, 
  History, Building, ExternalLink, ShieldCheck, FileText, 
  CheckCircle2
} from "lucide-react";
import SubidaDocumentos from "../../../components/SubidaDocumentos";
import ListaDocumentos from "../../../components/ListaDocumentos";

export default async function DetalleInquilino({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  // 1. RESOLVER PARÁMETROS E IDENTIDAD (URL LIMPIA)
  const { id } = await params;
  const cookieStore = await cookies();
  const uid = cookieStore.get("userId")?.value;

  if (!uid) redirect("/login");

  // 2. TRAER DATOS DEL INQUILINO CON SUS RELACIONES
  const inquilino = await prisma.inquilino.findUnique({
    where: { id: id },
    include: { 
        propiedad: true,
        pagos: { orderBy: { fechaPago: 'desc' } }
    }
  }) as any;

  if (!inquilino) return (
    <div className="p-20 text-center font-black bg-slate-900 h-screen text-white uppercase italic">
        Residente no localizado en la red.
    </div>
  );

  // 3. SEGURIDAD: Verificar que el que mira el expediente tenga permiso
  const userActivo = await prisma.usuario.findUnique({ where: { id: uid } });
  const isAdmin = userActivo?.rol === "ADMIN";
  const esDueñoDeLaCasa = inquilino.propiedad.usuarioId === uid;
  const esSuPropioPerfil = inquilino.usuarioId === uid;

  if (!isAdmin && !esDueñoDeLaCasa && !esSuPropioPerfil) {
    redirect("/dashboard");
  }

  const totalInvertido = inquilino.pagos.reduce((acc: number, p: any) => acc + p.monto, 0);

  return (
    <div className="p-4 md:p-8 bg-[#f8fafc] min-h-screen font-sans text-slate-900 italic-none">
      <div className="max-w-7xl mx-auto">
        
        {/* NAVEGACIÓN LIMPIA */}
        <Link href="/inquilinos" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 font-black text-[10px] uppercase tracking-[0.2em] mb-8 transition italic">
          <ArrowLeft size={16} /> Volver al Directorio
        </Link>

        {/* CABECERA DE EXPEDIENTE */}
        <div className="bg-white p-10 rounded-[60px] shadow-2xl shadow-blue-100 border border-slate-100 mb-10 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-center gap-8 relative z-10 text-center md:text-left">
                <div className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-indigo-700 rounded-[35px] flex items-center justify-center text-white shadow-xl shadow-blue-200 italic font-black text-3xl">
                    {inquilino.nombre.charAt(0)}
                </div>
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">{inquilino.nombre}</h1>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
                        <span className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest"><Mail size={14} className="text-blue-500"/> {inquilino.correo}</span>
                        <span className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest"><Phone size={14} className="text-green-500"/> {inquilino.telefono}</span>
                    </div>
                </div>
            </div>
            <div className="bg-slate-900 p-8 rounded-[40px] text-center md:text-right w-full md:w-auto shadow-2xl">
                <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-1 italic">Renta Mensual Pactada</p>
                <p className="text-4xl font-black text-blue-400 italic">${inquilino.propiedad.precio.toLocaleString()}</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            
            {/* IZQUIERDA: GESTIÓN PATRIMONIAL */}
            <div className="lg:col-span-1 space-y-8">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-6 italic">Vinculación Inmobiliaria</h3>
                
                <div className="bg-white p-8 rounded-[45px] border border-slate-100 shadow-sm relative group overflow-hidden transition-all hover:border-blue-200">
                    <Building className="text-blue-500 mb-6" size={32} />
                    <h4 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter mb-1">{inquilino.propiedad.nombre}</h4>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-8 line-clamp-2">{inquilino.propiedad.direccion}</p>
                    
                    <Link href={`/propiedades/${inquilino.propiedadId}`} className="flex items-center justify-between bg-slate-900 text-white p-5 rounded-2xl hover:bg-blue-600 transition-all group/btn">
                        <span className="text-[10px] font-black uppercase tracking-widest italic">Ver Inmueble</span>
                        <ExternalLink size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="bg-white p-8 rounded-[45px] border border-slate-100 shadow-sm border-b-8 border-b-green-500">
                    <p className="text-slate-300 text-[10px] font-black uppercase tracking-widest mb-2 italic">Capital Recaudado</p>
                    <h2 className="text-4xl font-black text-slate-900 italic">${totalInvertido.toLocaleString()}</h2>
                    <p className="text-[10px] font-bold text-green-500 mt-2 uppercase tracking-tighter flex items-center gap-2">
                        <CheckCircle2 size={12}/> Flujo de caja verificado
                    </p>
                </div>
            </div>

            {/* CENTRO: CRONOLOGÍA DE PAGOS */}
            <div className="lg:col-span-1 space-y-8">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-6 italic">Historial de Pagos</h3>
                <div className="bg-white rounded-[45px] border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
                    <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center gap-2">
                        <History size={16} className="text-slate-400" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Últimos movimientos</span>
                    </div>
                    
                    {inquilino.pagos.length === 0 ? (
                        <div className="p-20 text-center opacity-20">
                             <CreditCard size={48} className="mx-auto mb-4" />
                             <p className="font-black text-xs uppercase italic">Sin registros</p>
                        </div>
                    ) : (
                        inquilino.pagos.map((p: any) => (
                            <div key={p.id} className="p-6 border-b border-slate-50 flex justify-between items-center hover:bg-slate-50/50 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="bg-green-50 p-2.5 rounded-xl text-green-600 shadow-inner group-hover:bg-green-500 group-hover:text-white transition-all">
                                        <CreditCard size={18} />
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-800 text-xs uppercase tracking-tighter italic">{p.mesPagado}</p>
                                        <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Liquidado</p>
                                    </div>
                                </div>
                                <p className="font-black text-slate-900 text-lg tracking-tighter italic">${p.monto.toLocaleString()}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* DERECHA: BÓVEDA DOCUMENTAL */}
            <div className="lg:col-span-1 space-y-8">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-6 italic">Expediente Legal</h3>
                
                {/* Cargador de archivos */}
                <SubidaDocumentos inquilinoId={inquilino.id} />

                {/* Lista de archivos PDF */}
                <ListaDocumentos 
                    documentos={inquilino.documentos} 
                    inquilinoId={inquilino.id} 
                />
            </div>

        </div>
      </div>
    </div>
  );
}