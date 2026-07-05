// app/api/register/route.ts
import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { createSessionToken, getSecureCookieOptions } from "../../../lib/auth";
import { logger, serverErrorResponse } from "../../../lib/logger";

// BLOQUE 2: Validación estricta con Zod
const registerSchema = z.object({
  nombre: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(120).transform((v) => v.toLowerCase()),
  password: z.string().min(8).max(100),
  rol: z.enum(["PROPIETARIO", "INQUILINO"]).default("PROPIETARIO"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      // BLOQUE 5: Mensaje genérico — NO exponer detalles internos de validación
      return NextResponse.json({ error: "Datos inválidos. Verifica los campos." }, { status: 400 });
    }

    const { nombre, email, password, rol } = result.data;

    // Verificar si el email ya existe
    const existe = await prisma.usuario.findUnique({ where: { email } });
    if (existe) {
      return NextResponse.json({ error: "El correo ya está registrado" }, { status: 409 });
    }

    // BLOQUE 3: Hashear contraseña con bcrypt (factor de costo 12)
    const hash = await bcrypt.hash(password, 12);

    const usuario = await prisma.usuario.create({
      data: { nombre, email, password: hash, rol },
    });

    // BLOQUE 3: Crear JWT para sesión inmediata
    const token = await createSessionToken({
      id: usuario.id,
      nombre: usuario.nombre,
      rol: usuario.rol,
      plan: usuario.plan,
    });

    const response = NextResponse.json({
      ok: true,
      usuario: { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol, plan: usuario.plan },
    }, { status: 201 });

    // BLOQUE 3: Cookie HttpOnly + Secure + SameSite=Strict
    response.cookies.set("session", token, getSecureCookieOptions());

    return response;
  } catch (error) {
    // BLOQUE 5: Log interno, mensaje genérico al cliente
    logger.error("POST /api/register", error);
    return NextResponse.json(serverErrorResponse(), { status: 500 });
  }
}