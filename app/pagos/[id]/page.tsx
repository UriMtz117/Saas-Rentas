import { prisma } from "../../../lib/prisma";
import Link from "next/link";
import { ArrowLeft, User, Building, Calendar, ShieldCheck, DollarSign, Activity } from "lucide-react";
import AccionesRecibo from "../../../components/AccionesRecibo";

export default async function DetallePago({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;

  // Consultamos el pago con sus relaciones
  const pago = await prisma.pago.findUnique({
    where: { id: id },
    include: { 
        inquilino: { include: { propiedad: true } } 
    }
  });

  if (!pago) return (
    <div className="p-20 text-center font-black uppercase tracking-tighter">
      Comprobante no localizado.
    </div>
  );

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen flex flex-col items-center">
      <div className="w-full max-w-2xl">
        
        {/* BOTÓN REGRESAR (Se oculta al imprimir) */}
        <Link href="/pagos" className="no-print inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 font-black text-[10px] uppercase tracking-[0.2em] mb-10 transition">
          <ArrowLeft size={16} /> Volver a Finanzas
        </Link>

        {/* --- INICIO DEL RECIBO (receipt-card) --- */}
        <div className="bg-white rounded-[60px] shadow-2xl border border-slate-100 overflow-hidden relative border-b-[12px] border-b-blue-600 receipt-card">
            
            {/* Cabecera Oscura (receipt-header-bg) */}
            <div className="bg-slate-900 p-12 text-white text-center relative overflow-hidden receipt-header-bg">
                <div className="relative z-10">
                    <div className="bg-blue-600 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl no-print">
                        <ShieldCheck size={32} />
                    </div>
                    <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.5em] mb-3">Comprobante de Pago</p>
                    <h1 className="text-6xl font-black italic tracking-tighter">
                        ${pago.monto.toLocaleString()}
                    </h1>
                    <div className="mt-6 inline-flex items-center gap-2 bg-green-500/10 text-green-400 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-500/20">
                        Transacción Exitosa
                    </div>
                </div>
                <DollarSign size={220} className="absolute -right-12 -bottom-12 opacity-5 text-white no-print" />
            </div>

            {/* Datos Técnicos */}
            <div className="p-10 md:p-14 space-y-12 bg-white receipt-body-text">
                <div className="grid grid-cols-2 gap-10">
                    <div className="space-y-6 text-left">
                        <div className="space-y-1">
                            <p className="text-slate-300 font-black text-[9px] uppercase tracking-[0.2em]">Inquilino</p>
                            <p className="font-black text-slate-800 text-lg uppercase tracking-tighter">{pago.inquilino.nombre}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-slate-300 font-black text-[9px] uppercase tracking-[0.2em]">Propiedad</p>
                            <p className="font-bold text-slate-700 text-base uppercase tracking-tighter italic">{pago.inquilino.propiedad.nombre}</p>
                        </div>
                    </div>

                    <div className="space-y-6 text-right">
                        <div className="space-y-1">
                            <p className="text-slate-300 font-black text-[9px] uppercase tracking-[0.2em]">Folio Digital</p>
                            <p className="font-mono text-[10px] text-slate-400 uppercase">{pago.id}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-slate-300 font-black text-[9px] uppercase tracking-[0.2em]">Mes Liquidado</p>
                            <p className="font-black text-slate-800 text-base uppercase tracking-tighter">{pago.mesPagado}</p>
                        </div>
                    </div>
                </div>

                {/* BOTONES (Solo para pantalla) */}
                <AccionesRecibo 
                  nombreInquilino={pago.inquilino.nombre} 
                  monto={pago.monto} 
                />

                <div className="pt-6 text-center border-t border-slate-100 mt-6">
                    <p className="text-[9px] text-slate-300 font-black uppercase tracking-[0.4em]">
                        SISTEMA GENERADO POR INMOGESTION AI
                    </p>
                </div>
            </div>

            {/* Adornos visuales de ticket (se ven en pantalla y PDF) */}
            <div className="absolute left-0 bottom-[220px] w-5 h-10 bg-slate-50 rounded-r-full border-y border-r border-slate-100 hidden md:block"></div>
            <div className="absolute right-0 bottom-[220px] w-5 h-10 bg-slate-50 rounded-l-full border-y border-l border-slate-100 hidden md:block"></div>
        </div>
        {/* --- FIN DEL RECIBO --- */}

      </div>
    </div>
  );
}