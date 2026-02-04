import { prisma } from "../../lib/prisma";
import { Bell, Clock, FileText, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function NotificacionesPage({ searchParams }: { searchParams: Promise<{ uid?: string }> }) {
  const { uid } = await searchParams;

  const avisos = await prisma.notificacion.findMany({
    where: { usuarioId: uid || "no" },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-black text-slate-900 tracking-tighter italic uppercase mb-10">Bandeja de Entrada</h1>
        
        <div className="space-y-4">
          {avisos.map((aviso: any) => (
            <div key={aviso.id} className="bg-white p-8 rounded-[45px] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-xl transition-all">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-blue-600 rounded-[25px] flex items-center justify-center text-white shadow-lg">
                        <Bell size={28} />
                    </div>
                    <div>
                        <p className="font-black text-slate-800 text-lg uppercase tracking-tighter italic">{aviso.mensaje}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic flex items-center gap-2">
                            <Clock size={12} /> Recibido recientemente
                        </p>
                    </div>
                </div>
                {aviso.tipo === 'CONTRATO' && (
                    <Link href={`/contratos?uid=${uid}`} className="bg-slate-900 text-white p-4 rounded-2xl hover:bg-blue-600 transition-colors">
                        <ArrowRight size={20} />
                    </Link>
                )}
            </div>
          ))}

          {avisos.length === 0 && (
            <div className="py-40 text-center opacity-30 italic font-black uppercase tracking-widest">
                <Bell size={64} className="mx-auto mb-4" />
                Sin novedades por ahora
            </div>
          )}
        </div>
      </div>
    </div>
  );
}