import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { inquilinoId, propiedadId, monto, mesPagado, estado } = await req.json();

    // 1. Buscamos si el usuario ya es inquilino de ESA propiedad
    let perfil = await prisma.inquilino.findUnique({
      where: { usuarioId: inquilinoId }
    });

    // 2. Si no es inquilino aún, creamos el vínculo automáticamente al pagar
    if (!perfil) {
      const usuario = await prisma.usuario.findUnique({ where: { id: inquilinoId } });
      perfil = await prisma.inquilino.create({
        data: {
          nombre: usuario?.nombre || "Usuario",
          correo: usuario?.email || "",
          telefono: "5200000000",
          propiedadId: propiedadId,
          usuarioId: inquilinoId
        }
      });
    }

    // 3. Registramos el pago vinculado al perfil de inquilino
    const nuevoPago = await prisma.pago.create({
      data: {
        inquilinoId: perfil.id,
        monto: monto,
        mesPagado: mesPagado,
        estado: estado,
      }
    });

    return NextResponse.json(nuevoPago);
  } catch (error) {
    console.error("ERROR API PAGOS:", error);
    return NextResponse.json({ error: "Error de servidor" }, { status: 500 });
  }
}