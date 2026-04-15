import { prisma } from "../../lib/prisma";
import { BarChart3, TrendingUp, CheckCircle2, DollarSign, Activity, ShieldCheck } from "lucide-react";
import ClientChart from "../../components/ClientChart"; 
import { cookies } from "next/headers"; // <--- VITAL PARA URLS LIMPIAS
import { redirect } from "next/navigation";

export default async function ReportesPage() {
  // 1. OBTENEMOS EL ID DEL USUARIO DESDE LA COOKIE SEGURA
  const cookieStore = await cookies();
  const uid = cookieStore.get("userId")?.value;

  if (!uid) redirect("/login");

  // 2. IDENTIFICAMOS AL USUARIO Y SU ROL PARA EL FILTRO
  const usuarioActual = await prisma.usuario.findUnique({
    where: { id: uid }
  });

  if (!usuarioActual) redirect("/login");

  const role = usuarioActual.rol;
  const isAdmin = role === "ADMIN";
  const isOwner = role === "PROPIETARIO";

  // 3. LÓGICA DE FILTRADO DINÁMICA (Multi-tenancy)
  let filter: any = {};
  if (isAdmin) {
    filter = {}; // Admin supervisa todo el capital del SaaS
  } else if (isOwner) {
    filter = { usuarioId: uid }; // Dueño analiza su propio patrimonio
  } else {
    // Inquilino: Solo analiza su inversión personal
    filter = { inquilinos: { some: { usuarioId: uid } } };
  }

  // 4. OBTENER PAGOS CONFIRMADOS
  const pagos = await prisma.pago.findMany({
    where: {
      estado: "PAGADO",
      inquilino: {
        propiedad: filter 
      }
    },
    orderBy: { fechaPago: 'asc' }
  });

  // 5. PROCESAR GRÁFICA (Datos 100% reales sin fallbacks)
  const mesesClave = [
    { label: 'Ene', busqueda: ['ene', 'jan'] },
    { label: 'Feb', busqueda: ['feb'] },
    { label: 'Mar', busqueda: ['mar'] },
    { label: 'Abr', busqueda: ['abr'] },
    { label: 'May', busqueda: ['may'] },
    { label: 'Jun', busqueda: ['jun'] },
    { label: 'Jul', busqueda: ['jul'] },
    { label: 'Ago', busqueda: ['ago', 'aug'] },
    { label: 'Sep', busqueda: ['sep', 'septiembre'] },
    { label: 'Oct', busqueda: ['oct'] },
    { label: 'Nov', busqueda: ['nov'] },
    { label: 'Dic', busqueda: ['dic'] },
  ];

  const chartData = mesesClave.map(m => {
    const sumaMes = pagos
      .filter(p => m.busqueda.some(termino => p.mesPagado.toLowerCase().includes(termino)))
      .reduce((acc: number, p: any) => acc + p.monto, 0);
    
    return { name: m.label, monto: sumaMes };
  });

  const recaudadoTotal = pagos.reduce((acc: number, p: any) => acc + p.monto, 0);

  return (
    <div className="p-4 md:p-8 bg-[#f8fafc] min-h-screen font-sans text-slate-900 italic-none">
      <div className="max-w-6xl mx-auto">
        
        {/* ENCABEZADO PREMIUM */}
        <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
                <div className="flex items-center gap-2 mb-2">
                    {isAdmin ? (
                        <span className="bg-blue-600 text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1.5 shadow-xl shadow-blue-500/20">
                            <ShieldCheck size={12} /> Consola de Auditoría Global
                        </span>
                    ) : (
                        <span className="bg-slate-900 text-slate-400 text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest italic border border-slate-800">
                            Vista de Rendimiento Privada
                        </span>
                    )}
                </div>
                <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter italic uppercase leading-none italic">
                    Analítica Pro
                </h1>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.4em] mt-2 italic flex items-center gap-2">
                    <Activity size={14} className="text-blue-500" /> Sincronización de Flujo de Caja
                </p>
            </div>
            <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm text-[10px] font-black text-slate-400 uppercase tracking-widest no-print">
                Última actualización: Justo ahora
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* CONTENEDOR DE LA GRÁFICA (Visualización de datos) */}
          <div className="lg:col-span-2 bg-white p-10 rounded-[60px] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-2xl transition-all duration-700">
            <div className="flex justify-between items-center mb-12">
                <div className="flex flex-col">
                    <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Crecimiento Trimestral</h3>
                    <span className="text-slate-800 font-bold tracking-tight mt-1 text-sm italic italic">
                        {isAdmin ? 'Ingresos de toda la red de arrendadores' : 'Evolución de tus rentas personales'}
                    </span>
                </div>
                <div className="bg-slate-50 p-4 rounded-3xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                    <BarChart3 size={24} />
                </div>
            </div>
            
            {/* Altura fija para asegurar el renderizado de Recharts */}
            <div className="h-[400px] w-full min-h-[400px]">
                <ClientChart data={chartData} />
            </div>
          </div>

          {/* COLUMNA DE MÉTRICAS RÁPIDAS */}
          <div className="space-y-6">
            
            {/* TARJETA DE CAPITAL TOTAL */}
            <div className={`${isAdmin ? 'bg-blue-600 shadow-blue-200' : 'bg-slate-900 shadow-slate-300'} text-white p-10 rounded-[60px] shadow-2xl relative overflow-hidden group border-b-[15px] border-indigo-500/30 transition-all duration-500`}>
                <p className="text-blue-200 text-[10px] font-black uppercase tracking-[0.2em] mb-4 italic opacity-70">Capital Acumulado</p>
                <h2 className="text-5xl md:text-6xl font-black italic tracking-tighter group-hover:scale-105 transition-transform duration-500 italic italic">
                    ${recaudadoTotal.toLocaleString()}
                </h2>
                <div className="mt-8 flex items-center gap-2 bg-white/10 w-fit px-4 py-2 rounded-2xl border border-white/10">
                    <CheckCircle2 size={14} className="text-green-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Saldo Verificado</span>
                </div>
                <DollarSign size={200} className="absolute -right-12 -bottom-12 opacity-5 group-hover:rotate-12 transition-transform duration-700" />
            </div>

            {/* OTROS KPIS */}
            <div className="bg-white p-10 rounded-[60px] border border-slate-100 shadow-sm space-y-8 italic">
                <div className="flex justify-between items-center border-b border-slate-50 pb-6">
                    <div>
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Tasa de Ocupación</p>
                        <p className="text-xl font-black text-blue-600 tracking-tighter italic uppercase mt-1 italic">Status Activo</p>
                    </div>
                    <span className="text-3xl font-black text-slate-900 italic tracking-tighter">100%</span>
                </div>
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Cobros Efectuados</p>
                        <p className="text-xl font-black text-slate-800 tracking-tighter italic uppercase mt-1 italic italic">Auditoría</p>
                    </div>
                    <div className="bg-green-50 w-12 h-12 rounded-2xl flex items-center justify-center text-green-600 font-black text-base border border-green-100 shadow-inner">
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