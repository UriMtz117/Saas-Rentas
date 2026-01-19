import { prisma } from "../../../lib/prisma";
import { redirect } from "next/navigation";

export default async function NuevoInquilinoPage() {
  // Necesitamos las propiedades para saber a cuál asignar al inquilino
  const propiedades = await prisma.propiedad.findMany();

  async function crearInquilino(formData: FormData) {
    "use server";
    const nombre = formData.get("nombre") as string;
    const correo = formData.get("correo") as string;
    const telefono = formData.get("telefono") as string;
    const propiedadId = formData.get("propiedadId") as string;

    await prisma.inquilino.create({
      data: { nombre, correo, telefono, propiedadId }
    });

    redirect("/inquilinos");
  }

  return (
    <div className="p-10 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Nuevo Inquilino</h1>
      <form action={crearInquilino} className="space-y-4 bg-white p-6 rounded-xl shadow-md">
        <input name="nombre" type="text" placeholder="Nombre completo" className="w-full p-2 border rounded" required />
        <input name="correo" type="email" placeholder="Correo electrónico" className="w-full p-2 border rounded" required />
        <input name="telefono" type="text" placeholder="Teléfono" className="w-full p-2 border rounded" required />
        
        <div>
          <label className="block text-sm font-medium mb-1">Asignar a Propiedad:</label>
          <select name="propiedadId" className="w-full p-2 border rounded" required>
            <option value="">Selecciona una casa...</option>
            {propiedades.map(p => (
              <option key={p.id} value={p.id}>{p.nombre} - ${p.precio}</option>
            ))}
          </select>
        </div>

        <button type="submit" className="w-full bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700">
          Registrar Inquilino
        </button>
      </form>
    </div>
  );
}