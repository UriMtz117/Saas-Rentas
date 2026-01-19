import { prisma } from "../../lib/prisma"; // Corregimos a dos niveles ../../
import { Bell, MessageCircle } from "lucide-react"; // Importamos iconos bonitos

export default async function RecordatoriosPage() {
  // Buscamos pagos que NO estén pagados
  const pendientes = await prisma.pago.findMany({
    where: {
      estado: {
        not: "PAGADO",
      },
    },
    include: {
      inquilino: true,
    },
  });

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-red-100 p-3 rounded-2xl text-red-600">
            <Bell size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Recordatorios</h1>
            <p className="text-slate-500 font-medium">Gestiona los cobros pendientes de este mes.</p>
          </div>
        </div>

        <div className="grid gap-4">
          {pendientes.map((p: any) => ( // Agregamos :any para quitar el error de TypeScript
            <div key={p.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition">
              <div>
                <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">{p.mesPagado}</p>
                <h2 className="text-xl font-bold text-slate-800">{p.inquilino.nombre}</h2>
                <p className="text-sm text-slate-400 font-medium">Vencimiento próximo</p>
              </div>

              <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                <div className="text-right">
                  <p className="text-2xl font-black text-slate-900">${p.monto}</p>
                  <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold uppercase">
                    Pendiente
                  </span>
                </div>

                <a
                  href={`https://wa.me/${p.inquilino.telefono.replace(/\s+/g, '')}?text=Hola%20${p.inquilino.nombre},%20te%20saludamos%20de%20InmoGestion.%20Te%20recordamos%20tu%20pago%20pendiente%20de%20$${p.monto}%20correspondiente%20a%20${p.mesPagado}.`}
                  target="_blank"
                  className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-2xl shadow-lg shadow-green-100 transition flex items-center gap-2 font-bold text-sm"
                >
                  <MessageCircle size={18} />
                  Recordar
                </a>
              </div>
            </div>
          ))}

          {pendientes.length === 0 && (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-20 text-center">
              <p className="text-slate-400 font-bold text-lg italic">¡Felicidades! Todos los pagos están al día. 😎</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}