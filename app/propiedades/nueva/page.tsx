import { prisma } from "../../../lib/prisma";
import { redirect } from "next/navigation";

export default function NuevaPropiedadPage() {
  async function crearPropiedad(formData: FormData) {
    "use server"; // Esto hace que el código se ejecute en el servidor

    const nombre = formData.get("nombre") as string;
    const tipo = formData.get("tipo") as string;
    const direccion = formData.get("direccion") as string;
    const precio = parseFloat(formData.get("precio") as string);

    // Guardamos en Supabase usando Prisma
    await prisma.propiedad.create({
      data: { nombre, tipo, direccion, precio },
    });

    // Volvemos a la lista de propiedades
    redirect("/propiedades");
  }

  return (
    <div className="p-10 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Registrar Nueva Propiedad</h1>
      
      <form action={crearPropiedad} className="space-y-4 bg-white p-6 rounded-xl shadow-md">
        <div>
          <label className="block text-sm font-medium">Nombre de la propiedad</label>
          <input name="nombre" type="text" placeholder="Ej: Departamento 201" className="w-full p-2 border rounded" required />
        </div>

        <div>
          <label className="block text-sm font-medium">Tipo</label>
          <select name="tipo" className="w-full p-2 border rounded">
            <option value="Departamento">Departamento</option>
            <option value="Casa">Casa</option>
            <option value="Cuarto">Cuarto</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Dirección</label>
          <input name="direccion" type="text" placeholder="Calle Falsa 123" className="w-full p-2 border rounded" required />
        </div>

        <div>
          <label className="block text-sm font-medium">Precio de Renta ($)</label>
          <input name="precio" type="number" placeholder="5000" className="w-full p-2 border rounded" required />
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700">
          Guardar Propiedad
        </button>
      </form>
    </div>
  );
}