import { prisma } from "../../../lib/prisma"; // Asegúrate de que esta ruta sea correcta
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get("uid");

    if (!uid || uid === "undefined") return NextResponse.json([]);

    const notificaciones = await (prisma.notificacion as any).findMany({
      where: {
        usuarioId: uid,
        leido: false
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(notificaciones);
  } catch (error) {
    return NextResponse.json({ error: "Fallo en servidor" }, { status: 500 });
  }
}