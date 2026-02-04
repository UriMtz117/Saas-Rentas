import { prisma } from "../../lib/prisma";
import Link from "next/link";
import { FileText, PenTool, CheckCircle2, Building2, ArrowRight } from "lucide-react";

export default async function MisContratosPage({ searchParams }: { searchParams: Promise<{ uid?: string }> }) {
  const { uid } = await searchParams;

  // Buscamos contratos donde el inquilino tenga el usuarioId del que inició sesión
  const contratos = await prisma.contrato.findMany({
    where: { inquilino: { usuarioId: uid } },
    include: { inquilino: { include: { propiedad: true } } }
  });

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen font-sans">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-black text-slate-900 tracking-tighter italic uppercase mb-10">Mis Documentos</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {contratos.map((c: any) => (
            <div key={c.id} className="bg-white p-10 rounded-[55px] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
                <div className="bg-blue-50 p-4 rounded-2xl w-fit mb-6 text-blue-600 shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <FileText size={32} />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Propiedad Vinculada</p>
                <h2 className="text-2xl font-black text-slate-800 uppercase italic mb-10 tracking-tight">{c.inquilino.propiedad.nombre}</h2>
                
                <div className="flex flex-col gap-4">
                    {!c.firmado ? (
                        <Link href={`/contratos/firmar/${c.id}?uid=${uid}`} className="w-full bg-blue-600 text-white py-5 rounded-[25px] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-blue-100 hover:bg-slate-900 transition-all active:scale-95">
                            <PenTool size={16}/> Revisar y Firmar
                        </Link>
                    ) : (
                        <div className="bg-green-50 text-green-600 p-5 rounded-[25px] text-center font-black text-[10px] uppercase border border-green-100 italic flex items-center justify-center gap-2">
                            <CheckCircle2 size={16} /> Contrato Legalizado
                        </div>
                    )}
                </div>
                <Building2 size={150} className="absolute -right-8 -bottom-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-700 pointer-events-none" />
            </div>
          ))}

          {contratos.length === 0 && (
            <div className="col-span-2 py-40 text-center flex flex-col items-center opacity-30">
                <FileText size={64} className="mb-4" />
                <p className="font-black italic uppercase text-xl tracking-widest">No tienes contratos pendientes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}