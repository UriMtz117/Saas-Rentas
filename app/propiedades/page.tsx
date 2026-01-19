import { prisma } from "../../lib/prisma";
import Link from "next/link";

export default async function PropiedadesPage() {
  const propiedades = await prisma.propiedad.findMany();

  return (
    <div className="p-10 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Mis Propiedades</h1>
            <p className="text-gray-500 text-sm">Administra tus casas y departamentos.</p>
          </div>
          <Link href="/propiedades/nueva" className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 transition">
  + Nueva Propiedad
</Link>
        </div>

        {propiedades.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-20 text-center">
            <p className="text-gray-400 text-lg">Aún no tienes propiedades registradas.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {propiedades.map((p) => (
              <div key={p.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800">🏠 {p.nombre}</h2>
                <p className="text-gray-500 text-sm">{p.direccion}</p>
                <p className="text-blue-600 font-bold mt-4">${p.precio} / mes</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}