import { prisma } from "../../../lib/prisma";
import { redirect } from "next/navigation";

export default async function NuevoPagoPage() {
  const inquilinos = await prisma.inquilino.findMany();

  async function registrarPago(formData: FormData) {
    "use server";
    const inquilinoId = formData.get("inquilinoId") as string;
    const monto = parseFloat(formData.get("monto") as string);
    const mesPagado = formData.get("mesPagado") as string;
    const estado = formData.get("estado") as string;

    await prisma.pago.create({
      data: { inquilinoId, monto, mesPagado, estado }
    });

    redirect("/pagos");
  }

  return (
    <div className="p-10 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Registrar Nuevo Pago</h1>
      <form action={registrarPago} className="space-y-4 bg-white p-6 rounded-xl shadow-md">
        <div>
          <label className="block text-sm font-medium mb-1">Inquilino:</label>
          <select name="inquilinoId" className="w-full p-2 border rounded" required>
            <option value="">¿Quién paga?</option>
            {inquilinos.map(i => (
              <option key={i.id} value={i.id}>{i.nombre}</option>
            ))}
          </select>
        </div>

        <input name="monto" type="number" placeholder="Monto del pago ($)" className="w-full p-2 border rounded" required />
        <input name="mesPagado" type="text" placeholder="Ej: Octubre 2024" className="w-full p-2 border rounded" required />
        
        <select name="estado" className="w-full p-2 border rounded">
          <option value="PAGADO">PAGADO</option>
          <option value="PENDIENTE">PENDIENTE</option>
        </select>

        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700">
          Guardar Registro de Pago
        </button>
      </form>
    </div>
  );
}