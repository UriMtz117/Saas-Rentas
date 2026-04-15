import { prisma } from "../../../../lib/prisma";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, FileText, Award, Building2 } from "lucide-react";
import AccionesContrato from "../../../../components/AccionesContrato";

export default async function VerContratoFinal({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  // 1. Resolvemos el ID del contrato desde la URL dinámica
  const { id } = await params;

  // 2. Consultamos el contrato con sus relaciones (Inquilino y Casa)
  const contrato = await prisma.contrato.findUnique({
    where: { id },
    include: { 
      inquilino: { 
        include: { propiedad: true } 
      } 
    }
  }) as any;

  // 3. Validación de existencia
  if (!contrato) return (
    <div className="p-20 text-center flex flex-col items-center gap-4 bg-slate-900 h-screen text-white">
      <p className="font-black text-slate-500 text-3xl uppercase italic italic">Documento no localizado</p>
      <Link href="/dashboard" className="bg-blue-600 px-8 py-3 rounded-2xl font-bold uppercase text-xs">Volver al Inicio</Link>
    </div>
  );

  return (
    <div className="p-4 md:p-10 bg-slate-50 min-h-screen flex flex-col items-center font-sans text-slate-900 italic-none">
      
      {/* NAVEGACIÓN CON URL LIMPIA */}
      <div className="w-full max-w-4xl no-print">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 font-black text-[10px] uppercase tracking-widest mb-10 transition italic italic italic">
          <ArrowLeft size={16} /> Regresar al Dashboard
        </Link>
      </div>

      {/* --- HOJA LEGAL DIGITAL (receipt-card) --- */}
      <div className="w-full max-w-4xl bg-white shadow-2xl rounded-[40px] overflow-hidden border border-slate-200 receipt-card relative border-t-[15px] border-t-slate-900">
          
          {/* Sello de agua de seguridad (No visible en impresión) */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none no-print">
              <ShieldCheck size={500} className="rotate-12" />
          </div>

          {/* CABECERA DEL DOCUMENTO (receipt-header-bg) */}
          <div className="p-8 md:p-12 border-b border-slate-50 flex justify-between items-start bg-slate-900 text-white receipt-header-bg">
              <div>
                  <h1 className="text-3xl font-black italic uppercase tracking-tighter leading-tight italic">Acuerdo de Arrendamiento</h1>
                  <p className="text-blue-400 font-bold text-[8px] uppercase tracking-[0.3em] mt-2 italic no-print">Certificado Digital con Validez de Red</p>
              </div>
              <div className="text-right opacity-60">
                  <p className="text-[8px] font-black uppercase tracking-widest leading-none">ID Registro</p>
                  <p className="font-mono text-[10px] mt-1">{contrato.id.toUpperCase()}</p>
              </div>
          </div>

          <div className="p-10 md:p-20 relative z-10 receipt-body-text">
              {/* CUERPO DEL CONTRATO REDACTADO */}
              <div className="whitespace-pre-wrap font-serif text-lg leading-relaxed text-slate-800 italic bg-white p-4 mb-20 shadow-inner rounded-2xl">
                  {contrato.cuerpo}
              </div>

              {/* --- SECCIÓN DE FIRMAS DUALES (signature-section) --- */}
              <div className="grid grid-cols-2 gap-10 border-t border-dashed border-slate-200 pt-16 signature-section">
                  
                  {/* FIRMA DEL PROPIETARIO */}
                  <div className="text-center space-y-4">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic italic">El Arrendador</p>
                      <div className="h-24 flex items-center justify-center">
                          <img 
                            src={contrato.firmaOwner} 
                            className="h-full w-auto grayscale contrast-125 mix-blend-multiply" 
                            alt="Firma Dueño" 
                          />
                      </div>
                      <div className="h-px bg-slate-300 w-full mx-auto max-w-[180px]"></div>
                      <p className="text-[10px] font-bold text-slate-900 uppercase italic">Representante InmoGestion</p>
                  </div>

                  {/* FIRMA DEL INQUILINO */}
                  <div className="text-center space-y-4">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic italic">El Arrendatario</p>
                      <div className="h-24 flex items-center justify-center">
                          {contrato.firmado ? (
                              <img 
                                src={contrato.firmaImg} 
                                className="h-full w-auto grayscale contrast-125 mix-blend-multiply" 
                                alt="Firma Inquilino" 
                              />
                          ) : (
                              <p className="text-slate-200 font-black italic text-[10px] uppercase tracking-widest border border-slate-100 px-4 py-2 rounded-xl">Documento no firmado</p>
                          )}
                      </div>
                      <div className="h-px bg-slate-300 w-full mx-auto max-w-[180px]"></div>
                      <p className="text-[10px] font-bold text-slate-900 uppercase italic">{contrato.inquilino.nombre}</p>
                  </div>
              </div>

              {/* SELLO DE AUDITORÍA (seal-section) */}
              <div className="mt-20 flex flex-col items-center seal-section">
                  <div className="bg-slate-50 border border-slate-100 p-6 rounded-[30px] flex items-center gap-4 italic shadow-inner">
                      <Award className="text-blue-600 shrink-0" size={32} />
                      <div>
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Documento Protegido por</p>
                          <p className="text-xs font-black text-slate-800 uppercase italic tracking-tighter italic">InmoGestion AI Intelligence Systems 2026</p>
                      </div>
                  </div>
              </div>
          </div>

          {/* BOTÓN DE IMPRESIÓN / DESCARGA PDF */}
          <AccionesContrato />
          
      </div>
    </div>
  );
}