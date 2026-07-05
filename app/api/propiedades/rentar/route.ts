// app/api/propiedades/rentar/route.ts
import { prisma } from "../../../../lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "../../../../lib/auth";
import { logger, serverErrorResponse } from "../../../../lib/logger";

const rentarSchema = z.object({
  propiedadId: z.string().min(1),
  inquilinoId: z.string().min(1),
  fechaInicio: z.string().min(1),
  fechaFin: z.string().min(1),
  montoRenta: z.number().positive().max(1_000_000),
});

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
    const result = rentarSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    const { propiedadId, inquilinoId, fechaInicio, fechaFin, montoRenta } = result.data;

    const propiedad = await prisma.propiedad.findUnique({ where: { id: propiedadId } });
    if (!propiedad) {
      return NextResponse.json({ error: "Propiedad no encontrada" }, { status: 404 });
    }

    // BLOQUE 3: Verificar que la propiedad pertenece al propietario autenticado
    if (session.rol === "PROPIETARIO" && propiedad.usuarioId !== session.id) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }

    const inquilino = await prisma.inquilino.upsert({
      where: { usuarioId: inquilinoId },
      update: { propiedadId, fechaInicio, fechaFin, montoRenta },
      create: {
        usuarioId: inquilinoId,
        propiedadId,
        fechaInicio,
        fechaFin,
        montoRenta,
        nombre: "",
      },
    });

    return NextResponse.json({ inquilino });
  } catch (error) {
    logger.error("POST /api/propiedades/rentar", error);
    return NextResponse.json(serverErrorResponse(), { status: 500 });
  }
}