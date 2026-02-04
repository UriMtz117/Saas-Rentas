import { prisma } from "../../../../lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { propiedadId, usuarioId } = await req.json();

    // 1. Buscamos los datos del usuario para crear su perfil de inquilino
    const user = await prisma.usuario.findUnique({ where: { id: usuarioId } });

    if (!user) return NextResponse.json({ error: "Usuario no existe" }, { status: 404 });

    // 2. Creamos o actualizamos el registro de Inquilino
    // Usamos 'upsert' por si el usuario ya rentaba otra cosa, que se actualice a la nueva casa
    const renta = await prisma.inquilino.upsert({
      where: { usuarioId: usuarioId },
      update: { propiedadId: propiedadId },
      create: {
        nombre: user.nombre,
        correo: user.email,
        telefono: "5200000000", // Teléfono temporal
        propiedadId: propiedadId,
        usuarioId: usuarioId,
      },
    });

    return NextResponse.json(renta);
  } catch (error) {
    console.error("ERROR AL RENTAR:", error);
    return NextResponse.json({ error: "Error de servidor" }, { status: 500 });
  }
}