// app/api/contratos/detalle/route.ts
import { prisma } from "../../../../lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "../../../../lib/auth";
import { logger, serverErrorResponse } from "../../../../lib/logger";

const detalleSchema = z.object({
  inquilinoId: z.string().min(1),
});

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const result = detalleSchema.safeParse({ inquilinoId: searchParams.get("inquilinoId") });
    if (!result.success) {
      return NextResponse.json({ error: "Parámetro inválido" }, { status: 400 });
    }

    const contrato = await prisma.contrato.findUnique({
      where: { inquilinoId: result.data.inquilinoId },
      include: { inquilino: true },
    });

    return NextResponse.json({ contrato });
  } catch (error) {
    logger.error("GET /api/contratos/detalle", error);
    return NextResponse.json(serverErrorResponse(), { status: 500 });
  }
}