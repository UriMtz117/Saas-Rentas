import { prisma } from "../../lib/prisma";
import Link from "next/link";
import { 
  Users, ShieldCheck, CreditCard, Activity, 
  TrendingUp, UserCircle, Trash2, ArrowUpCircle,
  Crown, Globe, Zap, Filter
} from "lucide-react";
import { revalidatePath } from "next/cache";

// Next.js permite recibir los parámetros de la URL directamente
export default async function AdminDashboard({ 
  searchParams 
}: { 
  searchParams: Promise<{ plan?: string; rol?: string }> 
}) {
  
  // 1. Resolvemos los parámetros de búsqueda
  const filters = await searchParams;
  const currentPlan = filters.plan;
  const currentRol = filters.rol;

  // 2. Construimos la consulta a la base de datos basada en los filtros
  const whereClause: any = {};
  if (currentPlan) whereClause.plan = currentPlan;
  if (currentRol) whereClause.rol = currentRol;

  const usuarios = await prisma.usuario.findMany({ 
    where: whereClause,
    orderBy: { nombre: 'asc' } 
  });

  // Métricas rápidas (estas siempre son globales)
  const totalUsuariosCount = await prisma.usuario.count();
  const totalPropiedades = await prisma.propiedad.count();
  const ingresosData = await prisma.pago.aggregate({ _sum: { monto: true } });

  return (
    <div className="p-6 md:p-12 bg-[#f8fafc] min-h-screen">
      <div className="max-w-7xl mx-auto">
        
        {/* ENCABEZADO */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2 text-blue-600 font-black text-xs uppercase tracking-[0.3em]">
                <Globe size={14} /> Global Administration
            </div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter italic">Control Panel</h1>
          </div>
          <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">Server Status: 200 OK</span>
          </div>
        </div>

        {/* MÉTRICAS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-slate-900 text-white p-8 rounded-[40px] shadow-2xl relative overflow-hidden group">
            <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.2em] mb-2">Comunidad Total</p>
            <h2 className="text-5xl font-black">{totalUsuariosCount}</h2>
            <Users className="absolute -right-4 -bottom-4 opacity-10" size={100} />
          </div>

          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col justify-center relative overflow-hidden group">
            <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] mb-2">Unidades de Renta</p>
            <h2 className="text-4xl font-black text-slate-800">{totalPropiedades}</h2>
            <TrendingUp size={60} className="absolute -right-4 -bottom-4 text-slate-50" />
          </div>

          <div className="bg-blue-600 text-white p-8 rounded-[40px] shadow-xl shadow-blue-200 flex flex-col justify-center relative overflow-hidden">
            <p className="text-blue-100 text-[9px] font-black uppercase tracking-[0.2em] mb-2">Capital Global</p>
            <h2 className="text-3xl font-black italic tracking-tighter uppercase">${ingresosData._sum.monto?.toLocaleString() || 0}</h2>
          </div>
        </div>

        {/* SECCIÓN DE TABLA CON FILTROS DINÁMICOS */}
        <div className="bg-white rounded-[50px] border border-slate-100 shadow-sm overflow-hidden">
          
          {/* BARRA DE FILTROS ACTUALIZADA */}
          <div className="p-8 md:p-10 border-b border-slate-50 bg-white/50 backdrop-blur-md">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight italic flex items-center gap-2">
                        <Filter size={20} className="text-blue-600" /> Directorio Maestro
                    </h3>
                    <p className="text-xs text-slate-400 font-bold uppercase mt-1">Filtrando por: {currentPlan || 'Todos los planes'} / {currentRol || 'Todos los roles'}</p>
                </div>

                {/* BOTONERA DE FILTROS */}
                <div className="flex flex-wrap justify-center gap-2">
                    {/* Filtros por Plan */}
                    <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/50">
                        <FilterButton href="/admin" active={!currentPlan && !currentRol} label="Todos" />
                        <FilterButton href="/admin?plan=BASICO" active={currentPlan === 'BASICO'} label="Básicos" />
                        <FilterButton href="/admin?plan=ORO" active={currentPlan === 'ORO'} label="Premium" />
                    </div>
                    {/* Filtros por Rol */}
                    <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/50 ml-0 md:ml-4">
                        <FilterButton href="/admin?rol=ADMIN" active={currentRol === 'ADMIN'} label="Admins" />
                        <FilterButton href="/admin?rol=USER" active={currentRol === 'USER'} label="Arrendadores" />
                    </div>
                </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <tr>
                  <th className="p-8 text-center w-20">#</th>
                  <th className="p-8">Nombre del Usuario</th>
                  <th className="p-8">Suscripción</th>
                  <th className="p-8">Rol de Acceso</th>
                  <th className="p-8 text-right">Estatus</th>
                </tr>
              </thead>
              <tbody className="text-sm font-medium">
                {usuarios.map((u: any, index: number) => (
                  <tr key={u.id} className="border-b border-slate-50 hover:bg-blue-50/30 transition-all group">
                    <td className="p-8 text-center text-slate-300 font-black italic">{index + 1}</td>
                    <td className="p-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                                <UserCircle size={24} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-slate-800 font-black uppercase text-base tracking-tighter">{u.nombre}</span>
                                <span className="text-slate-400 text-[10px] font-bold tracking-widest">{u.email}</span>
                            </div>
                        </div>
                    </td>
                    <td className="p-8">
                      <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-2xl font-black text-[9px] tracking-widest uppercase shadow-sm ${u.plan === 'ORO' ? 'bg-amber-100 text-amber-600 border border-amber-200' : 'bg-slate-100 text-slate-500'}`}>
                        {u.plan === 'ORO' && <Crown size={12} fill="currentColor" />}
                        {u.plan || 'BÁSICO'}
                      </div>
                    </td>
                    <td className="p-8">
                      <span className={`flex items-center gap-2 font-black text-[10px] uppercase tracking-widest ${u.rol === 'ADMIN' ? 'text-blue-600' : 'text-slate-300'}`}>
                        {u.rol === 'ADMIN' ? <ShieldCheck size={16} /> : <CreditCard size={16} />}
                        {u.rol}
                      </span>
                    </td>
                    <td className="p-8 text-right">
                        <span className="w-2 h-2 bg-green-500 rounded-full inline-block animate-pulse shadow-lg shadow-green-200"></span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {usuarios.length === 0 && (
            <div className="p-32 text-center flex flex-col items-center">
                <div className="bg-slate-50 p-8 rounded-[35px] mb-6 text-slate-200 border border-slate-100 shadow-inner">
                    <Users size={60} />
                </div>
                <h4 className="text-slate-800 font-black text-2xl tracking-tighter italic uppercase">Cero Resultados</h4>
                <p className="text-slate-400 font-bold text-sm mt-1">No hay usuarios que coincidan con estos filtros.</p>
                <Link href="/admin" className="mt-8 text-blue-600 font-black text-xs uppercase tracking-widest border-b-2 border-blue-600 pb-1 hover:text-blue-700 transition-colors">Limpiar todos los filtros</Link>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// Componente pequeño para los botones de filtro
function FilterButton({ href, active, label }: { href: string, active: boolean, label: string }) {
    return (
        <Link 
            href={href} 
            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                active 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
        >
            {label}
        </Link>
    );
}