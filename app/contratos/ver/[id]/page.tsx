import { prisma } from "../../../../lib/prisma";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, FileText, Award } from "lucide-react";
import AccionesContrato from "../../../../components/AccionesContrato";

export default async function VerContratoFinal({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const contrato = await prisma.contrato.findUnique({
    where: { id },
    include: { inquilino: { include: { propiedad: true } } }
  }) as any;

  if (!contrato) return <div className="p-20 text-center font-black opacity-20 uppercase tracking-widest">Documento Inexistente</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-10 flex flex-col items-center font-sans text-slate-900">
      
      <div className="w-full max-w-4xl no-print">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 font-black text-[10px] uppercase tracking-widest mb-10 transition italic">
          <ArrowLeft size={16} /> Volver al panel de control
        </Link>
      </div>

      <div className="w-full max-w-4xl bg-white shadow-2xl rounded-[40px] overflow-hidden border border-slate-200 receipt-card relative border-t-[15px] border-t-slate-900">
          
          <div className="p-8 border-b border-slate-50 flex justify-between items-start bg-slate-900 text-white receipt-header-bg">
              <div>
                  <h1 className="text-2xl font-black italic uppercase tracking-tighter">Acuerdo de Arrendamiento</h1>
                  <p className="text-blue-400 font-bold text-[8px] uppercase tracking-[0.3em] mt-1 italic">Certificado Digital Autorizado</p>
              </div>
              <div className="text-right opacity-60">
                  <p className="text-[8px] font-black uppercase tracking-widest leading-none">ID Registro</p>
                  <p className="font-mono text-[10px]">{contrato.id.toUpperCase()}</p>
              </div>
          </div>

          <div className="p-10 md:p-14 relative z-10 receipt-body-text">
              <div className="whitespace-pre-wrap font-serif text-base leading-relaxed text-slate-800 italic bg-white mb-10">
                  {contrato.cuerpo}
              </div>

              {/* SECCIÓN DE FIRMAS COMPACTA */}
              <div className="grid grid-cols-2 gap-10 border-t border-dashed border-slate-200 pt-10 signature-section">
                  <div className="text-center space-y-2">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic">El Arrendador</p>
                      <div className="h-20 flex items-center justify-center">
                          <img src={contrato.firmaOwner} className="h-full w-auto grayscale contrast-125 mix-blend-multiply" alt="Firma Dueño" />
                      </div>
                      <div className="h-px bg-slate-300 w-full mx-auto max-w-[150px]"></div>
                      <p className="text-[9px] font-bold text-slate-900 uppercase">Propietario InmoGestion</p>
                  </div>

                  <div className="text-center space-y-2">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic">El Arrendatario</p>
                      <div className="h-20 flex items-center justify-center">
                          {contrato.firmado ? (
                              <img src={contrato.firmaImg} className="h-full w-auto grayscale contrast-125 mix-blend-multiply" alt="Firma Inquilino" />
                          ) : (
                              <p className="text-slate-200 font-bold italic text-xs uppercase tracking-widest">Pendiente</p>
                          )}
                      </div>
                      <div className="h-px bg-slate-300 w-full mx-auto max-w-[150px]"></div>
                      <p className="text-[9px] font-bold text-slate-900 uppercase">{contrato.inquilino.nombre}</p>
                  </div>
              </div>

              {/* Sello de Auditoría */}
              <div className="mt-12 flex flex-col items-center seal-section">
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-3xl flex items-center gap-4 italic shadow-inner">
                      <Award className="text-blue-600" size={24} />
                      <p className="text-[8px] font-black text-slate-800 uppercase italic tracking-widest">Documento Validado por InmoGestion AI Systems 2026</p>
                  </div>
              </div>
          </div>

          <AccionesContrato />
      </div>
    </div>
  );
}