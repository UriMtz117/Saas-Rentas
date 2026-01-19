import { prisma } from "../../lib/prisma";
import Link from "next/link";

export default async function InquilinosPage() {
  const inquilinos = await prisma.inquilino.findMany({
    include: { propiedad: true }
  });

  return (
    <div className="p-10 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Inquilinos (CRM)</h1>
            <p className="text-gray-500 text-sm">Administra tus contactos y rentas.</p>
          </div>
          <Link href="/inquilinos/nuevo" className="bg-green-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-green-700 transition">
            + Registrar Inquilino
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-4 font-semibold text-gray-600">Nombre</th>
                <th className="p-4 font-semibold text-gray-600">Propiedad</th>
                <th className="p-4 font-semibold text-gray-600">Contacto</th>
              </tr>
            </thead>
            <tbody>
              {inquilinos.map((i) => (
                <tr key={i.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4 font-medium">{i.nombre}</td>
                  <td className="p-4 text-sm font-semibold text-blue-600">
                    {i.propiedad.nombre}
                  </td>
                  <td className="p-4 text-sm text-gray-500">
                    {i.correo} <br /> {i.telefono}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {inquilinos.length === 0 && (
            <p className="p-10 text-center text-gray-400">No hay inquilinos registrados.</p>
          )}
        </div>
      </div>
    </div>
  );
}