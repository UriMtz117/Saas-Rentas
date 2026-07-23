// app/api/inquilinos/route.ts
import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "../../../lib/auth";
import { logger, serverErrorResponse } from "../../../lib/logger";

const inquilinoSchema = z.object({
  nombre: z.string().trim().min(2).max(80),
  correo: z.string().trim().email().max(120).optional().default(""),  // ← correo, no email
  telefono: z.string().trim().max(20).optional().default(""),
  propiedadId: z.string().min(1),
  fechaInicio: z.string().min(1),
  fechaFin: z.string().min(1),
  montoRenta: z.number().positive().max(1_000_000),
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
        ? { propiedad: { usuarioId: session.id } }
        : { usuarioId: session.id };

    const inquilinos = await prisma.inquilino.findMany({
      where,
      include: { propiedad: true },
      orderBy: { id: "desc" },
    });

    return NextResponse.json({ inquilinos });
  } catch (error) {
    logger.error("GET /api/inquilinos", error);
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
    const result = inquilinoSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    const inquilino = await prisma.inquilino.create({ data: result.data });
    return NextResponse.json({ inquilino }, { status: 201 });
  } catch (error) {
    logger.error("POST /api/inquilinos", error);
    return NextResponse.json(serverErrorResponse(), { status: 500 });
  }
}