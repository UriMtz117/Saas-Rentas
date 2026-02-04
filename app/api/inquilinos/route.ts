import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get("uid");

    // BUSCAMOS LOS INQUILINOS
    const inquilinos = await prisma.inquilino.findMany({
      where: {
        // Filtro: Si el usuario es dueño, solo ve sus inquilinos
        propiedad: {
          usuarioId: uid || undefined
        }
      },
      // VITAL: Esto es lo que te falta para que no de error
      include: {
        propiedad: true 
      }
    });

    return NextResponse.json(inquilinos);
  } catch (error) {
    console.error("Error al obtener inquilinos:", error);
    return NextResponse.json({ error: "Fallo al obtener la lista" }, { status: 500 });
  }
}