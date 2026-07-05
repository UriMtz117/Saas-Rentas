// app/api/contratos/firmar/route.ts
import { prisma } from "../../../../lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "../../../../lib/auth";
import { logger, serverErrorResponse } from "../../../../lib/logger";

const firmarSchema = z.object({
  contratoId: z.string().min(1),
  firmaInquilino: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const result = firmarSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    const { contratoId, firmaInquilino } = result.data;

    const contrato = await prisma.contrato.update({
      where: { id: contratoId },
      data: { firmaInquilino, firmado: true },
    });

    return NextResponse.json({ contrato });
  } catch (error) {
    logger.error("POST /api/contratos/firmar", error);
    return NextResponse.json(serverErrorResponse(), { status: 500 });
  }
}