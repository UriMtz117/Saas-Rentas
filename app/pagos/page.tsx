import { prisma } from "../../lib/prisma";
import Link from "next/link";

export default async function PagosPage() {
  // Traemos los pagos incluyendo al inquilino para saber quién pagó
  const pagos = await prisma.pago.findMany({
    include: { inquilino: true },
    orderBy: { fechaPago: 'desc' }
  });

  return (
    <div className="p-10 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Control de Pagos</h1>
            <p className="text-gray-500 text-sm">Historial de rentas recibidas.</p>
          </div>
          <Link href="/pagos/nuevo" className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 transition">
            + Registrar Pago
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {pagos.map((p) => (
            <div key={p.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
              <div>
                <p className="font-bold text-gray-800">{p.inquilino.nombre}</p>
                <p className="text-sm text-gray-500">Mes: {p.mesPagado}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-green-600">${p.monto}</p>
                <span className={`text-xs px-2 py-1 rounded ${p.estado === 'PAGADO' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {p.estado}
                </span>
              </div>
            </div>
          ))}
          {pagos.length === 0 && <p className="text-center text-gray-400 p-10">No hay pagos registrados todavía.</p>}
        </div>
      </div>
    </div>
  );
}