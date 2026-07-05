// app/api/contratos/route.ts
import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "../../../lib/auth";
import { logger, serverErrorResponse } from "../../../lib/logger";

// BLOQUE 2: Validación con Zod
const contratoSchema = z.object({
  inquilinoId: z.string().min(1),
  cuerpo: z.string().min(10).max(50000),
  firmaOwner: z.string().optional(),
  firmadoOwner: z.boolean().default(false),
});

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const where =
      session.rol === "ADMIN"
        ? {}
        : session.rol === "PROPIETARIO"
        ? { inquilino: { propiedad: { usuarioId: session.id } } }
        : { inquilino: { usuarioId: session.id } };

    const contratos = await prisma.contrato.findMany({
      where,
      include: { inquilino: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ contratos });
  } catch (error) {
    logger.error("GET /api/contratos", error);
    return NextResponse.json(serverErrorResponse(), { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    if (session.rol !== "PROPIETARIO" && session.rol !== "ADMIN") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }

    const body = await req.json();
    const result = contratoSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    const { inquilinoId, cuerpo, firmaOwner, firmadoOwner } = result.data;

    // BLOQUE 2: Consulta parametrizada con Prisma (sin concatenación SQL)
    const contrato = await prisma.contrato.upsert({
      where: { inquilinoId },
      update: { cuerpo, firmaOwner, firmadoOwner, firmado: false },
      create: { inquilinoId, cuerpo, firmaOwner, firmadoOwner, firmado: false },
    });

    return NextResponse.json({ contrato });
  } catch (error) {
    logger.error("POST /api/contratos", error);
    return NextResponse.json(serverErrorResponse(), { status: 500 });
  }
}