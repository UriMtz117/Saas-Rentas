// app/api/propiedades/route.ts
import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "../../../lib/auth";
import { logger, serverErrorResponse } from "../../../lib/logger";

// BLOQUE 2: Validación de entrada para POST
const propiedadSchema = z.object({
  nombre: z.string().trim().min(2).max(100),
  tipo: z.enum(["Casa", "Departamento", "Cuarto", "Local", "Bodega"]),
  direccion: z.string().trim().min(5).max(200),
  precio: z.number().positive().max(1_000_000),
  lat: z.number().optional(),
  lng: z.number().optional(),
  fotos: z.array(z.string().url()).optional().default([]),
});

export async function GET() {
  try {
    // BLOQUE 3: Verificar sesión desde cookie (no desde query param uid)
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    let filter = {};

    if (session.rol === "PROPIETARIO") {
      filter = { usuarioId: session.id };
    } else if (session.rol === "INQUILINO") {
      const perfil = await prisma.inquilino.findUnique({ where: { usuarioId: session.id } });
      if (!perfil?.propiedadId) {
        return NextResponse.json({ propiedades: [] });
      }
      filter = { id: perfil.propiedadId };
    } else if (session.rol === "ADMIN") {
      filter = {}; // Admin ve todo
    }

    const propiedades = await prisma.propiedad.findMany({
      where: filter,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ propiedades });
  } catch (error) {
    logger.error("GET /api/propiedades", error);
    return NextResponse.json(serverErrorResponse(), { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // BLOQUE 3: Verificar sesión y rol
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    if (session.rol !== "PROPIETARIO" && session.rol !== "ADMIN") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }

    const body = await req.json();
    const result = propiedadSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    const propiedad = await prisma.propiedad.create({
      data: {
        ...result.data,
        usuarioId: session.id,
      },
    });

    return NextResponse.json({ propiedad }, { status: 201 });
  } catch (error) {
    logger.error("POST /api/propiedades", error);
    return NextResponse.json(serverErrorResponse(), { status: 500 });
  }
}