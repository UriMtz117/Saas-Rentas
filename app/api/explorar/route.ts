// app/api/explorar/route.ts
import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";
import { logger, serverErrorResponse } from "../../../lib/logger";

// Ruta pública — no requiere sesión
const filtrosSchema = z.object({
  tipo: z.enum(["Casa", "Departamento", "Cuarto", "Local", "Bodega", "todos"]).optional(),
  precioMin: z.coerce.number().min(0).optional(),
  precioMax: z.coerce.number().min(0).optional(),
  ciudad: z.string().trim().max(100).optional(),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const result = filtrosSchema.safeParse({
      tipo: searchParams.get("tipo"),
      precioMin: searchParams.get("precioMin"),
      precioMax: searchParams.get("precioMax"),
      ciudad: searchParams.get("ciudad"),
    });

    if (!result.success) {
      return NextResponse.json({ error: "Filtros inválidos" }, { status: 400 });
    }

    const { tipo, precioMin, precioMax } = result.data;

    // BLOQUE 2: Consulta parametrizada con Prisma
    const propiedades = await prisma.propiedad.findMany({
      where: {
        ...(tipo && tipo !== "todos" ? { tipo } : {}),
        ...(precioMin !== undefined ? { precio: { gte: precioMin } } : {}),
        ...(precioMax !== undefined ? { precio: { lte: precioMax } } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ propiedades });
  } catch (error) {
    logger.error("GET /api/explorar", error);
    return NextResponse.json(serverErrorResponse(), { status: 500 });
  }
}