// app/api/pagos/route.ts
import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "../../../lib/auth";
import { logger, serverErrorResponse } from "../../../lib/logger";

// BLOQUE 2: Validación estricta de entrada con Zod
const pagoSchema = z.object({
  inquilinoId: z.string().min(1),
  propiedadId: z.string().min(1),
  monto: z.number().positive().max(1_000_000),
  mesPagado: z.string().min(1).max(20),
  estado: z.enum(["PENDIENTE", "PAGADO", "ATRASADO"]).default("PAGADO"),
  metodoPago: z.string().max(50).optional(),
  notas: z.string().max(500).optional(),
});

export async function GET() {
  try {
    // BLOQUE 3: Verificar sesión
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const where =
      session.rol === "ADMIN"
        ? {}
        : session.rol === "PROPIETARIO"
        ? { propiedad: { usuarioId: session.id } }
        : { inquilino: { usuarioId: session.id } };

    const pagos = await prisma.pago.findMany({
      where,
      include: { inquilino: true, propiedad: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ pagos });
  } catch (error) {
    logger.error("GET /api/pagos", error);
    return NextResponse.json(serverErrorResponse(), { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const result = pagoSchema.safeParse(body);
    if (!result.success) {
      // BLOQUE 5: No exponer detalles de validación
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    const { inquilinoId, propiedadId, monto, mesPagado, estado, metodoPago, notas } = result.data;

    // BLOQUE 2: ORM con consultas parametrizadas (Prisma) — sin concatenación directa
    let perfil = await prisma.inquilino.findUnique({ where: { usuarioId: inquilinoId } });

    if (!perfil) {
      const usuario = await prisma.usuario.findUnique({ where: { id: inquilinoId } });
      if (!usuario) {
        return NextResponse.json({ error: "Inquilino no encontrado" }, { status: 404 });
      }
      perfil = await prisma.inquilino.create({
        data: {
          usuarioId: inquilinoId,
          propiedadId,
          nombre: usuario.nombre,
          fechaInicio: new Date().toISOString(),
          fechaFin: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          montoRenta: monto,
        },
      });
    }

    const pago = await prisma.pago.create({
      data: {
        inquilinoId: perfil.id,
        propiedadId,
        monto,
        mesPagado,
        estado,
        metodoPago,
        notas,
      },
    });

    return NextResponse.json({ pago }, { status: 201 });
  } catch (error) {
    logger.error("POST /api/pagos", error);
    return NextResponse.json(serverErrorResponse(), { status: 500 });
  }
}