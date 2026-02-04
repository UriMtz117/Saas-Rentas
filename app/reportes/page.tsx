import { prisma } from "../../lib/prisma";
import { BarChart3, TrendingUp, CheckCircle2, DollarSign, Activity, ShieldCheck } from "lucide-react";
import ClientChart from "../../components/ClientChart"; 

export default async function ReportesPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ uid?: string }> 
}) {
  const { uid } = await searchParams;

  // 1. IDENTIFICAR AL USUARIO Y SU ROL
  const user = await prisma.usuario.findUnique({
    where: { id: uid || "no-id" }
  });

  const isAdmin = user?.rol === "ADMIN";
  const filter = isAdmin ? {} : { usuarioId: uid };

  // 2. OBTENER PAGOS REALES (Solo los cobrados)
  const pagos = await prisma.pago.findMany({
    where: {
      estado: "PAGADO",
      inquilino: isAdmin ? {} : { propiedad: filter }
    },
    orderBy: { fechaPago: 'asc' }
  });

  // 3. PROCESAR GRÁFICA (Datos 100% reales)
  const meses = [
    { label: 'Ene', terms: ['ene', 'jan'] },
    { label: 'Feb', terms: ['feb'] },
    { label: 'Mar', terms: ['mar'] },
    { label: 'Abr', terms: ['abr'] },
    { label: 'May', terms: ['may'] },
    { label: 'Jun', terms: ['jun'] },
    { label: 'Jul', terms: ['jul'] },
    { label: 'Ago', terms: ['ago', 'aug'] },
    { label: 'Sep', terms: ['sep', 'septiembre'] },
    { label: 'Oct', terms: ['oct'] },
    { label: 'Nov', terms: ['nov'] },
    { label: 'Dic', terms: ['dic'] },
  ];

  const chartData = meses.map(m => ({
    name: m.label,
    monto: pagos
      .filter(p => m.terms.some(t => p.mesPagado.toLowerCase().includes(t)))
      .reduce((acc: number, curr: any) => acc + curr.monto, 0)
  }));

  const totalGlobal = pagos.reduce((acc: number, p: any) => acc + p.monto, 0);

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen font-sans">
      <div className="max-w-6xl mx-auto">
        
        <div className="mb-12 flex justify-between items-end">
            <div>
                <div className="mb-2">
                    {isAdmin ? (
                        <span className="bg-blue-600 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1 shadow-lg shadow-blue-200 w-fit">
                            <ShieldCheck size={10} /> Consola Global Maestro
                        </span>
                    ) : (
                        <span className="bg-slate-200 text-slate-500 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-slate-300 w-fit">
                            Vista Arrendador Privada
                        </span>
                    )}
                </div>
                <h1 className="text-5xl font-black text-slate-900 tracking-tighter italic uppercase leading-none italic">Analítica Pro</h1>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.4em] mt-2 italic flex items-center gap-2">
                    <Activity size={14} className="text-blue-500" /> Auditoría de Ingresos Reales
                </p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          <div className="lg:col-span-2 bg-white p-10 rounded-[55px] border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="flex justify-between items-center mb-12">
                <div className="flex flex-col">
                    <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Crecimiento Mensual</h3>
                    <span className="text-slate-800 font-bold tracking-tight mt-1 text-sm italic italic">Flujo de caja {isAdmin ? 'global' : 'privado'}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                    <BarChart3 size={20} />
                </div>
            </div>
            
            {/* FIX: Contenedor con altura fija para evitar errores de Recharts */}
            <div className="h-[400px] w-full min-h-[400px]">
                <ClientChart data={chartData} />
            </div>
          </div>

          <div className="space-y-6">
            <div className={`${isAdmin ? 'bg-blue-600 shadow-blue-200' : 'bg-slate-900 shadow-slate-300'} text-white p-10 rounded-[50px] shadow-2xl relative overflow-hidden group border-b-[12px] border-indigo-400 transition-all`}>
                <p className="text-blue-100 text-[10px] font-black uppercase tracking-[0.2em] mb-2 italic opacity-70">Capital Acumulado</p>
                <h2 className="text-5xl font-black italic tracking-tighter group-hover:scale-105 transition-transform duration-500">
                    ${totalGlobal.toLocaleString()}
                </h2>
                <DollarSign size={180} className="absolute -right-10 -bottom-10 opacity-5 group-hover:rotate-12 transition-transform duration-700" />
            </div>

            <div className="bg-white p-10 rounded-[50px] border border-slate-100 shadow-sm space-y-8">
                <div className="flex justify-between items-center border-b border-slate-50 pb-6">
                    <div>
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Ocupación</p>
                        <p className="text-xl font-black text-blue-600 tracking-tighter italic uppercase mt-1 italic">Óptimo</p>
                    </div>
                    <span className="text-3xl font-black text-slate-900 italic tracking-tighter italic">100%</span>
                </div>
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Transacciones</p>
                        <p className="text-xl font-black text-slate-800 tracking-tighter italic uppercase mt-1 italic italic">Confirmadas</p>
                    </div>
                    <div className="bg-green-50 w-10 h-10 rounded-2xl flex items-center justify-center text-green-600 font-black text-xs border border-green-100 shadow-inner">
                        {pagos.length}
                    </div>
                </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}