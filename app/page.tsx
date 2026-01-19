import { prisma } from "../lib/prisma";
import Link from "next/link";
import BotonIA from "../components/BotonIA";

export default async function DashboardPage() {
  // 1. Consultas a la base de datos (Supabase)
  const totalPropiedades = await prisma.propiedad.count();
  const totalInquilinos = await prisma.inquilino.count();
  
  // Sumar ingresos de pagos confirmados
  const ingresosData = await prisma.pago.aggregate({
    _sum: { monto: true },
    where: { estado: "PAGADO" }
  });
  const ingresosTotales = ingresosData._sum.monto || 0;

  // Traer los últimos 5 movimientos
  const ultimosPagos = await prisma.pago.findMany({
    take: 5,
    include: { inquilino: true },
    orderBy: { fechaPago: 'desc' }
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        
        {/* Encabezado */}
        <div className="mb-10">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Panel de Control</h1>
          <p className="text-gray-500 mt-2">Bienvenido de nuevo. Así va tu negocio hoy.</p>
        </div>

        {/* TARJETAS DE ESTADÍSTICAS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Ingresos Totales</p>
            <h3 className="text-4xl font-black text-green-600 mt-1">${ingresosTotales.toLocaleString()}</h3>
            <p className="text-[10px] text-gray-400 mt-4 font-medium uppercase">Actualizado hace un momento</p>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Unidades</p>
            <h3 className="text-4xl font-black text-blue-600 mt-1">{totalPropiedades}</h3>
            <Link href="/propiedades" className="text-xs text-blue-500 font-bold hover:underline mt-4 inline-block">Gestionar Inventario →</Link>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Inquilinos</p>
            <h3 className="text-4xl font-black text-purple-600 mt-1">{totalInquilinos}</h3>
            <Link href="/inquilinos" className="text-xs text-purple-500 font-bold hover:underline mt-4 inline-block">Ver todos los contratos →</Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* LISTA DE PAGOS RECIENTES */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Pagos Recientes</h2>
              <Link href="/pagos" className="text-xs font-bold text-gray-400 hover:text-blue-600 uppercase">Ver todos</Link>
            </div>
            
            <div className="space-y-4">
              {ultimosPagos.map((pago: any) => (
                <div key={pago.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition">
                  <div>
                    <p className="font-bold text-gray-800">{pago.inquilino.nombre}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">{pago.mesPagado}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-gray-800">${pago.monto}</p>
                    <span className="text-[9px] bg-green-200 text-green-700 px-2 py-0.5 rounded-full font-black uppercase">
                      Confirmado
                    </span>
                  </div>
                </div>
              ))}
              {ultimosPagos.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-gray-400 text-sm">No hay actividad reciente para mostrar.</p>
                </div>
              )}
            </div>
          </div>

          {/* ACCESO A IA Y ACCIONES RÁPIDAS */}
          <div className="flex flex-col gap-6">
            <div className="bg-blue-600 p-8 rounded-3xl text-white relative overflow-hidden shadow-xl shadow-blue-200">
              <div className="relative z-10">
                <h2 className="text-2xl font-black mb-3 italic">IA de Soporte</h2>
                <p className="text-blue-100 text-sm mb-8 leading-relaxed">
                  ¿Tienes dudas sobre deudas, contratos o fechas de vencimiento? Consulta a tu asistente personal ahora.
                </p>
                <div className="flex gap-3">
                   {/* AQUÍ USAMOS EL COMPONENTE CLIENTE */}
                   <BotonIA />
                   
                   <Link href="/pagos/nuevo" className="bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-blue-400 transition flex items-center">
                     Registrar Pago
                   </Link>
                </div>
              </div>
              <div className="absolute -right-4 -bottom-4 text-9xl opacity-10">🤖</div>
            </div>

            <div className="bg-gray-900 p-8 rounded-3xl text-white flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Suscripción</p>
                <h3 className="text-xl font-bold mt-1">Plan Premium Activo</h3>
              </div>
              <div className="w-12 h-12 border-4 border-blue-600 rounded-full border-t-transparent animate-spin-slow"></div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}