// app/inquilinos/[id]/page.tsx
import { prisma } from "../../../lib/prisma";
import Link from "next/link";
import { ArrowLeft, User, Phone, Mail, CreditCard, History, Building, ExternalLink } from "lucide-react";

export default async function DetalleInquilino({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;

  // Traemos al inquilino con su propiedad y todos sus pagos
  const inquilino = await prisma.inquilino.findUnique({
    where: { id: id },
    include: { 
        propiedad: true,
        pagos: { orderBy: { fechaPago: 'desc' } }
    }
  });

  if (!inquilino) return <div className="p-20 text-center font-black">Residente no encontrado.</div>;

  const totalInvertido = inquilino.pagos.reduce((acc, p) => acc + p.monto, 0);

  return (
    <div className="p-8 bg-slate-50 min-h-screen font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* REGRESAR */}
        <Link href="/inquilinos" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 font-black text-[10px] uppercase tracking-widest mb-8 transition">
          <ArrowLeft size={16} /> Volver al listado
        </Link>

        {/* CABECERA PERFIL */}
        <div className="bg-white p-10 rounded-[50px] shadow-2xl shadow-blue-100 border border-slate-100 mb-10 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-center gap-8 relative z-10 text-center md:text-left">
                <div className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-indigo-700 rounded-[35px] flex items-center justify-center text-white shadow-xl shadow-blue-200">
                    <User size={48} />
                </div>
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">{inquilino.nombre}</h1>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-3">
                        <span className="flex items-center gap-1.5 text-slate-400 text-xs font-bold"><Mail size={14}/> {inquilino.correo}</span>
                        <span className="flex items-center gap-1.5 text-slate-400 text-xs font-bold"><Phone size={14}/> {inquilino.telefono}</span>
                    </div>
                </div>
            </div>
            <div className="bg-slate-50 p-6 rounded-[35px] border border-slate-100 text-center md:text-right w-full md:w-auto">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Renta Actual</p>
                <p className="text-3xl font-black text-blue-600">${inquilino.propiedad.precio.toLocaleString()}</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* IZQUIERDA: INFORMACIÓN DE LA PROPIEDAD */}
            <div className="lg:col-span-1 space-y-6">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Contrato de Vivienda</h3>
                <div className="bg-slate-900 text-white p-8 rounded-[40px] shadow-xl relative group">
                    <Building className="text-blue-500 mb-4" size={32} />
                    <h4 className="text-xl font-black mb-1">{inquilino.propiedad.nombre}</h4>
                    <p className="text-slate-500 text-xs font-medium mb-6">{inquilino.propiedad.direccion}</p>
                    
                    <Link href={`/propiedades/${inquilino.propiedadId}`} className="flex items-center justify-between bg-white/10 p-4 rounded-2xl hover:bg-white/20 transition group">
                        <span className="text-xs font-bold uppercase tracking-tighter">Ver Inmueble</span>
                        <ExternalLink size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Histórico de Pagos</p>
                    <h2 className="text-3xl font-black text-slate-800">${totalInvertido.toLocaleString()}</h2>
                    <p className="text-xs font-bold text-green-500 mt-1 uppercase tracking-tighter">Monto recaudado total</p>
                </div>
            </div>

            {/* DERECHA: TABLA DE PAGOS DEL INQUILINO */}
            <div className="lg:col-span-2 space-y-6">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Cronología de Cobranza</h3>
                <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-slate-50 flex items-center gap-2">
                        <History size={18} className="text-slate-300" />
                        <span className="font-bold text-slate-800 tracking-tight">Últimos movimientos registrados</span>
                    </div>
                    
                    {inquilino.pagos.length === 0 ? (
                        <div className="p-20 text-center">
                             <CreditCard size={40} className="mx-auto text-slate-200 mb-4" />
                             <p className="text-slate-300 font-bold italic tracking-tight">No hay registros financieros para este inquilino.</p>
                        </div>
                    ) : (
                        inquilino.pagos.map((p) => (
                            <div key={p.id} className="p-6 border-b border-slate-50 flex justify-between items-center hover:bg-slate-50/50 transition">
                                <div className="flex items-center gap-4">
                                    <div className="bg-green-100 p-2 rounded-xl text-green-600">
                                        <CreditCard size={16} />
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-800 text-sm uppercase tracking-tighter">{p.mesPagado}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Pago Confirmado</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-slate-900 text-lg">${p.monto.toLocaleString()}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}