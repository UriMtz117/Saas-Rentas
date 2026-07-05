// app/api/login/verificar/route.ts
import { NextResponse } from "next/server";
import { getSession } from "../../../../lib/auth";
import { logger, serverErrorResponse } from "../../../../lib/logger";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ autenticado: false }, { status: 401 });
    }

    return NextResponse.json({
      autenticado: true,
      usuario: {
        id: session.id,
        nombre: session.nombre,
        rol: session.rol,
        plan: session.plan,
      },
    });
  } catch (error) {
    logger.error("GET /api/login/verificar", error);
    return NextResponse.json(serverErrorResponse(), { status: 500 });
  }
}