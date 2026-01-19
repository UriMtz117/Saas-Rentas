import { prisma } from "../../lib/prisma";
import { Users, ShieldCheck, TrendingUp } from "lucide-react";

export default async function AdminDashboard() {
  // Estadísticas globales del SaaS
  const totalUsuarios = await prisma.usuario.count();
  const ingresosSaaS = 1500; // Ejemplo de ganancia por suscripciones

  return (
    <div className="p-10 bg-slate-50 min-h-screen">
      <h1 className="text-3xl font-black mb-8">Panel de Administración SaaS</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl">
          <Users className="mb-4 text-blue-400" />
          <p className="text-slate-400 text-xs font-bold uppercase">Usuarios Totales</p>
          <h2 className="text-4xl font-black">{totalUsuarios}</h2>
        </div>

        <div className="bg-white p-8 rounded-3xl border shadow-sm">
          <TrendingUp className="mb-4 text-green-500" />
          <p className="text-slate-400 text-xs font-bold uppercase">Ingresos SaaS</p>
          <h2 className="text-4xl font-black text-slate-900">${ingresosSaaS}</h2>
        </div>

        <div className="bg-white p-8 rounded-3xl border shadow-sm">
          <ShieldCheck className="mb-4 text-purple-500" />
          <p className="text-slate-400 text-xs font-bold uppercase">Estado del Sistema</p>
          <h2 className="text-xl font-bold text-green-500 mt-2 text-4xl">ÓPTIMO</h2>
        </div>
      </div>

      <div className="mt-10 bg-white p-8 rounded-3xl border shadow-sm">
        <h3 className="font-bold mb-4">Usuarios Recientes</h3>
        {/* Aquí harías un map de los usuarios de la BD */}
        <p className="text-slate-400 text-sm italic">Pronto: Tabla de gestión de suscripciones...</p>
      </div>
    </div>
  );
}