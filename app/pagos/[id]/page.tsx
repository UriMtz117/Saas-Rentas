import { prisma } from "../../../lib/prisma";
import Link from "next/link";
import { ArrowLeft, User, Building, Calendar, ShieldCheck, DollarSign, CreditCard } from "lucide-react";
import AccionesRecibo from "../../../components/AccionesRecibo";

export default async function DetallePago({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  // 1. Resolvemos el ID de la operación desde la URL dinámica
  const { id } = await params;

  // 2. Consultamos el pago con sus relaciones (Inquilino y Propiedad)
  const pago = await prisma.pago.findUnique({
    where: { id: id },
    include: { 
        inquilino: { include: { propiedad: true } } 
    }
  });

  // 3. Validación de existencia
  if (!pago) return (
    <div className="p-20 text-center flex flex-col items-center gap-4 bg-slate-900 h-screen text-white font-sans">
      <p className="font-black text-slate-500 text-2xl uppercase italic tracking-tighter">Comprobante no localizado</p>
      <Link href="/pagos" className="bg-blue-600 px-8 py-3 rounded-2xl font-bold uppercase text-xs">Volver a Finanzas</Link>
    </div>
  );

  return (
    <div className="p-4 md:p-8 bg-[#f8fafc] min-h-screen flex flex-col items-center font-sans text-slate-900 italic-none">
      <div className="w-full max-w-2xl">
        
        {/* NAVEGACIÓN CON URL LIMPIA */}
        <Link href="/pagos" className="no-print inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 font-black text-[10px] uppercase tracking-[0.2em] mb-10 transition italic">
          <ArrowLeft size={16} /> Regresar a Finanzas
        </Link>

        {/* --- CONTENEDOR DEL RECIBO (receipt-card) --- */}
        <div className="bg-white rounded-[60px] shadow-2xl shadow-blue-100/50 border border-slate-100 overflow-hidden relative border-b-[12px] border-b-blue-600 receipt-card">
            
            {/* Cabecera del Recibo - Estilo Dark Fintech (receipt-header-bg) */}
            <div className="bg-slate-900 p-12 text-white text-center relative overflow-hidden receipt-header-bg">
                <div className="relative z-10">
                    <div className="bg-blue-600 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/20 no-print">
                        <ShieldCheck size={32} />
                    </div>
                    <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.5em] mb-3 italic">Comprobante Oficial de Pago</p>
                    <h1 className="text-6xl font-black italic tracking-tighter flex items-center justify-center gap-1 italic">
                        <span className="text-2xl text-slate-500 not-italic font-medium">$</span>
                        {pago.monto.toLocaleString()}
                    </h1>
                    <div className="mt-6 inline-flex items-center gap-2 bg-green-500/10 text-green-400 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-500/20">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                        Transacción Confirmada
                    </div>
                </div>
                
                {/* Adorno de fondo (Solo visual) */}
                <DollarSign size={220} className="absolute -right-12 -bottom-12 opacity-5 text-white no-print" />
            </div>

            {/* Cuerpo del Recibo (receipt-body-text) */}
            <div className="p-10 md:p-14 space-y-12 bg-white receipt-body-text">
                
                {/* Grid de Información Técnica */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-8">
                        <div className="space-y-1">
                            <p className="text-slate-300 font-black text-[9px] uppercase tracking-[0.2em]">Responsable</p>
                            <p className="font-black text-slate-800 text-lg uppercase tracking-tighter italic">
                                <User size={16} className="text-blue-500 inline mr-2" /> {pago.inquilino.nombre}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-slate-300 font-black text-[9px] uppercase tracking-[0.2em]">Unidad Habitacional</p>
                            <p className="font-bold text-slate-700 text-base uppercase tracking-tighter italic">
                                <Building size={16} className="text-blue-500 inline mr-2" /> {pago.inquilino.propiedad.nombre}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-8 text-left md:text-right">
                        <div className="space-y-1">
                            <p className="text-slate-300 font-black text-[9px] uppercase tracking-[0.2em]">ID de Operación</p>
                            <p className="font-mono text-[10px] text-slate-400 bg-slate-50 px-3 py-1 rounded-lg inline-block uppercase">{pago.id}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-slate-300 font-black text-[9px] uppercase tracking-[0.2em]">Periodo Liquidado</p>
                            <p className="font-black text-slate-800 text-base uppercase tracking-tighter italic">
                                <Calendar size={16} className="text-blue-500 inline mr-2 md:ml-2 md:mr-0" /> {pago.mesPagado}
                            </p>
                        </div>
                    </div>
                </div>

                {/* COMPONENTE DE ACCIONES (Botones Reales de Impresión) */}
                <AccionesRecibo 
                  nombreInquilino={pago.inquilino.nombre} 
                  monto={pago.monto} 
                />

                <div className="pt-6 text-center border-t border-slate-100">
                    <p className="text-[9px] text-slate-300 font-black uppercase tracking-[0.4em]">
                        SISTEMA GENERADO POR INMOGESTION AI © 2026
                    </p>
                </div>
            </div>

            {/* Efecto visual de ticket (corte lateral) */}
            <div className="absolute left-0 bottom-[220px] w-5 h-10 bg-[#f8fafc] rounded-r-full border-y border-r border-slate-100 hidden md:block"></div>
            <div className="absolute right-0 bottom-[220px] w-5 h-10 bg-[#f8fafc] rounded-l-full border-y border-l border-slate-100 hidden md:block"></div>
        </div>

      </div>
    </div>
  );
}