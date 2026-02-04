import { prisma } from "../../../lib/prisma";
import { revalidatePath } from "next/cache";
import { 
  Crown, Zap, Check, ShieldCheck, 
  Users, ArrowLeft, Star, Gem 
} from "lucide-react";
import Link from "next/link";

export default async function SuscripcionesPage() {
  const usuarios = await prisma.usuario.findMany({
    orderBy: { plan: 'desc' }
  });

  // --- SERVER ACTION PARA CAMBIAR PLANES ---
  async function cambiarPlan(id: string, nuevoPlan: string) {
    "use server";
    await prisma.usuario.update({
      where: { id },
      data: { plan: nuevoPlan }
    });
    revalidatePath("/admin/suscripciones");
  }

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen">
      <div className="max-w-6xl mx-auto">
        
        {/* ENCABEZADO */}
        <div className="flex justify-between items-center mb-12">
            <Link href="/admin" className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-black text-[10px] uppercase tracking-widest transition">
                <ArrowLeft size={16} /> Volver a Consola
            </Link>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase">Gestión de Suscripciones</h1>
        </div>

        {/* COMPARATIVA DE PLANES (DISEÑO PREMIUM) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            
            {/* PLAN BÁSICO */}
            <div className="bg-white p-10 rounded-[50px] border border-slate-100 shadow-sm relative overflow-hidden group">
                <div className="bg-slate-50 w-16 h-16 rounded-3xl flex items-center justify-center text-slate-400 mb-6 group-hover:bg-slate-900 group-hover:text-white transition-all duration-500">
                    <Zap size={28} />
                </div>
                <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter mb-2 text-balance">Plan Estándar</h3>
                <p className="text-slate-400 text-sm font-medium mb-8">Ideal para arrendadores con menos de 3 propiedades.</p>
                <ul className="space-y-4 mb-10">
                    <li className="flex items-center gap-3 text-xs font-bold text-slate-600"><Check size={16} className="text-green-500"/> Registro de 3 unidades</li>
                    <li className="flex items-center gap-3 text-xs font-bold text-slate-600"><Check size={16} className="text-green-500"/> Gestión de Inquilinos</li>
                    <li className="flex items-center gap-3 text-xs font-bold text-slate-300 opacity-50"><Check size={16}/> Reportes con IA</li>
                </ul>
                <div className="text-3xl font-black text-slate-900 italic">$0 <small className="text-xs text-slate-300 not-italic font-bold">/ MES</small></div>
            </div>

            {/* PLAN ORO (EL QUE VENDE EL SAAS) */}
            <div className="bg-slate-900 p-10 rounded-[50px] shadow-2xl shadow-blue-200 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8">
                    <Crown size={60} className="text-blue-600 opacity-20 group-hover:scale-110 transition-transform" />
                </div>
                <div className="bg-blue-600 w-16 h-16 rounded-3xl flex items-center justify-center text-white mb-6 shadow-xl shadow-blue-500/40">
                    <Gem size={28} />
                </div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Plan InmoOro</h3>
                <p className="text-slate-500 text-sm font-medium mb-8">Propiedades ilimitadas y Chatbot IA avanzado.</p>
                <ul className="space-y-4 mb-10">
                    <li className="flex items-center gap-3 text-xs font-bold text-slate-300"><Check size={16} className="text-blue-500"/> Unidades Ilimitadas</li>
                    <li className="flex items-center gap-3 text-xs font-bold text-slate-300"><Check size={16} className="text-blue-500"/> Asistente Gemini IA 24/7</li>
                    <li className="flex items-center gap-3 text-xs font-bold text-slate-300"><Check size={16} className="text-blue-500"/> WhatsApp Alerts Pro</li>
                </ul>
                <div className="text-3xl font-black text-white italic text-blue-500">$29 <small className="text-xs text-slate-500 not-italic font-bold text-white">/ MES</small></div>
            </div>
        </div>

        {/* TABLA DE ASIGNACIÓN RÁPIDA */}
        <div className="bg-white rounded-[45px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 bg-slate-50/30">
                <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2 italic uppercase">
                    <Users className="text-blue-600" /> Control de Suscriptores
                </h3>
            </div>
            
            <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                    <tr>
                        <th className="p-6">Usuario</th>
                        <th className="p-6">Plan Actual</th>
                        <th className="p-6 text-right">Actualizar Plan</th>
                    </tr>
                </thead>
                <tbody className="text-sm">
                    {usuarios.map((u: any) => (
                        <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                            <td className="p-6">
                                <div className="flex flex-col">
                                    <span className="text-slate-800 font-bold uppercase tracking-tighter">{u.nombre}</span>
                                    <span className="text-slate-400 text-[10px] font-bold">{u.email}</span>
                                </div>
                            </td>
                            <td className="p-6">
                                <span className={`px-4 py-1.5 rounded-2xl font-black text-[9px] tracking-widest border ${u.plan === 'ORO' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                                    {u.plan === 'ORO' ? '🏆 ORO PREMIUM' : '⚡ BÁSICO'}
                                </span>
                            </td>
                            <td className="p-6">
                                <div className="flex justify-end gap-2">
                                    <form action={cambiarPlan.bind(null, u.id, "BASICO")}>
                                        <button className="px-4 py-2 bg-slate-100 hover:bg-slate-900 hover:text-white rounded-xl text-[10px] font-black uppercase transition-all">Básico</button>
                                    </form>
                                    <form action={cambiarPlan.bind(null, u.id, "ORO")}>
                                        <button className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl text-[10px] font-black uppercase transition-all">Subir a Oro</button>
                                    </form>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

      </div>
    </div>
  );
}