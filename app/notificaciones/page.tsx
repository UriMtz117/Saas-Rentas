import { prisma } from "../../lib/prisma";
import { Bell, Clock, FileText, CheckCircle2, ArrowRight, Zap, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function NotificacionesPage() {
  // 1. OBTENEMOS EL ID DEL USUARIO DESDE LA COOKIE (URL LIMPIA)
  const cookieStore = await cookies();
  const uid = cookieStore.get("userId")?.value;

  if (!uid) redirect("/login");

  // 2. CONSULTAMOS LAS NOTIFICACIONES REALES EN SUPABASE
  const avisos = await prisma.notificacion.findMany({
    where: { 
        usuarioId: uid,
        leido: false // Solo mostramos las pendientes
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="p-4 md:p-8 bg-[#f8fafc] min-h-screen font-sans text-slate-900 italic-none">
      <div className="max-w-4xl mx-auto">
        
        {/* ENCABEZADO PREMIUM */}
        <div className="mb-12 flex justify-between items-end">
            <div>
                <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter italic uppercase leading-none italic">Bandeja</h1>
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.4em] mt-2 italic">Avisos del Sistema en Tiempo Real</p>
            </div>
            <div className="bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest no-print">
                <ShieldCheck size={12} className="text-blue-500" /> Cifrado 256-bit
            </div>
        </div>
        
        {/* LISTA DE AVISOS */}
        <div className="space-y-6">
          {avisos.map((aviso: any) => (
            <div key={aviso.id} className="bg-white p-8 rounded-[50px] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between group hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 border-l-[12px] border-l-blue-600">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-blue-50 rounded-[28px] flex items-center justify-center text-blue-600 shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                        {aviso.tipo === 'CONTRATO' ? <FileText size={28} /> : <Bell size={28} />}
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1 italic">Notificación de {aviso.tipo}</p>
                        <p className="font-black text-slate-800 text-xl uppercase tracking-tighter italic italic">{aviso.mensaje}</p>
                        <div className="flex items-center gap-2 mt-2">
                             <Clock size={12} className="text-slate-300" />
                             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">Recibido recientemente</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 mt-6 md:mt-0">
                    {/* LINK LIMPIO (Sin ?uid=) */}
                    {aviso.tipo === 'CONTRATO' ? (
                        <Link 
                            href="/contratos" 
                            className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 flex items-center gap-2"
                        >
                            Ir a Firmar <ArrowRight size={14} />
                        </Link>
                    ) : (
                        <button className="p-4 bg-slate-50 text-slate-300 rounded-2xl hover:bg-green-50 hover:text-green-500 transition-all">
                            <CheckCircle2 size={20} />
                        </button>
                    )}
                </div>
            </div>
          ))}

          {/* ESTADO VACÍO */}
          {avisos.length === 0 && (
            <div className="py-40 text-center flex flex-col items-center">
                <div className="bg-white p-10 rounded-[45px] shadow-inner border border-slate-50 mb-8">
                    <Zap size={64} className="text-slate-100" />
                </div>
                <h2 className="text-3xl font-black text-slate-800 uppercase italic tracking-tighter">Bandeja Vacía</h2>
                <p className="text-slate-300 font-bold text-sm mt-1 uppercase tracking-widest italic text-balance px-10">
                    No tienes alertas pendientes de lectura. Todo tu ecosistema inmobiliario se encuentra al día.
                </p>
                <Link href="/dashboard" className="mt-10 text-blue-600 font-black text-xs uppercase tracking-[0.2em] border-b-2 border-blue-600 pb-1 hover:text-slate-900 hover:border-slate-900 transition-all">
                    Volver al Inicio
                </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}