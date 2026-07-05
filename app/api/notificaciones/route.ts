// app/api/notificaciones/route.ts
import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";
import { getSession } from "../../../lib/auth";
import { logger, serverErrorResponse } from "../../../lib/logger";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const notificaciones = await prisma.notificacion.findMany({
      where: { usuarioId: session.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ notificaciones });
  } catch (error) {
    logger.error("GET /api/notificaciones", error);
    return NextResponse.json(serverErrorResponse(), { status: 500 });
  }
}