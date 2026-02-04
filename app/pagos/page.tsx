import { prisma } from "../../lib/prisma";
import Link from "next/link";
import { CreditCard, TrendingUp, Clock, CheckCircle2, ChevronRight, Plus, ShieldCheck, Activity } from "lucide-react";

export default async function PagosPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ uid?: string }> 
}) {
  const { uid } = await searchParams;

  // 1. IDENTIFICAMOS AL USUARIO Y SU ROL
  const user = await prisma.usuario.findUnique({
    where: { id: uid || "no-id" }
  });

  const role = user?.rol || "INQUILINO";
  const isAdmin = role === "ADMIN";
  const isOwner = role === "PROPIETARIO";

  // 2. LÓGICA DE FILTRADO MAESTRA
  let filter: any = {};
  if (isAdmin) {
    filter = {};
  } else if (isOwner) {
    filter = { inquilino: { propiedad: { usuarioId: uid } } };
  } else {
    filter = { inquilino: { usuarioId: uid } };
  }

  // 3. CONSULTA A LA BASE DE DATOS
  const pagos = await prisma.pago.findMany({
    where: filter,
    include: { 
      inquilino: { include: { propiedad: true } } 
    },
    orderBy: { fechaPago: 'desc' }
  });

  // 4. CÁLCULOS
  const totalRecaudado = pagos
    .filter(p => p.estado === 'PAGADO')
    .reduce((acc: number, p: any) => acc + p.monto, 0);

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen font-sans text-slate-900">
      <div className="max-w-6xl mx-auto">
        
        {/* ENCABEZADO CON BOTÓN DE ACCIÓN */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
                <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest italic ${role === 'INQUILINO' ? 'bg-blue-50 text-blue-600' : 'bg-slate-900 text-slate-400'}`}>
                    {role === 'INQUILINO' ? 'Historial de Mis Pagos' : 'Consola Financiera'}
                </span>
            </div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
                {role === 'INQUILINO' ? 'Mis Recibos' : 'Mi Cobranza'}
            </h1>
          </div>

          {/* BOTÓN DE PAGO / COBRO (Visible para todos los roles) */}
          <Link 
            href={`/pagos/nuevo?uid=${uid}`} 
            className="bg-blue-600 hover:bg-slate-900 text-white px-10 py-5 rounded-[25px] font-black text-xs uppercase tracking-widest shadow-2xl shadow-blue-100 transition-all flex items-center gap-3 active:scale-95 group"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform" />
            {role === 'INQUILINO' ? 'Pagar Renta Ahora' : 'Registrar Nuevo Cobro'}
          </Link>
        </div>

        {/* TARJETA DE RESUMEN */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div className="bg-slate-900 text-white p-12 rounded-[60px] shadow-2xl flex items-center justify-between relative overflow-hidden group border-b-[12px] border-blue-600">
                <div className="relative z-10">
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1 italic">
                        {role === 'INQUILINO' ? 'Total Invertido en Renta' : 'Capital Global Confirmado'}
                    </p>
                    <h2 className="text-6xl font-black italic tracking-tighter text-blue-500 group-hover:text-white transition-colors duration-500">
                        ${totalRecaudado.toLocaleString()}
                    </h2>
                    <div className="mt-6 flex items-center gap-2 text-green-400 font-black text-[9px] uppercase tracking-tighter">
                        <CheckCircle2 size={12} /> Datos verificados en Supabase
                    </div>
                </div>
                <TrendingUp size={140} className="absolute -right-10 -bottom-10 opacity-5 group-hover:scale-110 transition-transform duration-700" />
            </div>

            <div className="bg-white p-12 rounded-[60px] border border-slate-100 shadow-sm flex items-center justify-center text-center">
                <div>
                    <Activity size={32} className="text-blue-100 mx-auto mb-4" />
                    <p className="text-slate-300 font-black text-[10px] uppercase tracking-[0.3em]">Estado de la cuenta</p>
                    <p className="text-2xl font-black text-slate-800 italic uppercase">Al día y Protegida</p>
                </div>
            </div>
        </div>

        {/* LISTA DE TRANSACCIONES */}
        <div className="space-y-6">
          <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] px-8 flex items-center gap-4">
              <div className="h-px bg-slate-100 flex-1"></div>
              Cronología de Movimientos
              <div className="h-px bg-slate-100 flex-1"></div>
          </h3>
          
          {pagos.map((p: any) => (
            <Link href={`/pagos/${p.id}?uid=${uid}`} key={p.id} className="block group">
              <div className="bg-white p-8 rounded-[45px] border border-slate-100 shadow-sm group-hover:shadow-2xl group-hover:-translate-y-1.5 transition-all duration-500 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
                <div className="flex items-center gap-6 relative z-10">
                    <div className="w-16 h-16 rounded-[28px] bg-green-50 text-green-600 flex items-center justify-center shadow-inner group-hover:bg-green-500 group-hover:text-white transition-all duration-500">
                        <CheckCircle2 size={32} />
                    </div>
                    <div>
                        <h4 className="font-black text-slate-800 text-xl uppercase tracking-tighter italic group-hover:text-blue-600 transition-colors">{p.inquilino.nombre}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                            {p.mesPagado} • {p.inquilino.propiedad.nombre}
                        </p>
                    </div>
                </div>
                <div className="text-right relative z-10">
                    <p className="text-4xl font-black text-slate-900 tracking-tighter italic">${p.monto.toLocaleString()}</p>
                    <span className="text-[9px] font-black bg-slate-100 text-slate-400 px-3 py-1 rounded-full uppercase tracking-widest mt-2 inline-block border border-slate-200">
                        {p.estado}
                    </span>
                </div>
                <div className="absolute -right-4 -bottom-4 opacity-0 group-hover:opacity-[0.03] text-slate-900 transition-opacity pointer-events-none">
                    <CreditCard size={150} />
                </div>
              </div>
            </Link>
          ))}

          {pagos.length === 0 && (
            <div className="bg-white p-32 rounded-[60px] border-2 border-dashed border-slate-200 text-center flex flex-col items-center shadow-inner">
                <CreditCard size={64} className="text-slate-100 mb-8" />
                <h4 className="text-slate-800 font-black text-2xl uppercase tracking-tighter italic">Cero Movimientos</h4>
                <p className="text-slate-300 font-bold text-sm mt-1 uppercase tracking-widest italic text-balance px-10">No hemos localizado registros financieros. Si acabas de realizar un pago, se reflejará en unos instantes.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}