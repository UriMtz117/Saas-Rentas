// app/api/login/route.ts
import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { createSessionToken, getSecureCookieOptions } from "../../../lib/auth";
import { logger, serverErrorResponse } from "../../../lib/logger";

// BLOQUE 2: Validación estricta de entrada
const loginSchema = z.object({
  email: z.string().trim().email().transform((v) => v.toLowerCase()),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      // BLOQUE 5: No revelar detalles de validación
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }

    const { email, password } = result.data;

    const user = await prisma.usuario.findUnique({ where: { email } });

    // BLOQUE 2 & 3: Mensaje genérico para no revelar si el email existe
    if (!user) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }

    // BLOQUE 3: Verificar hash bcrypt
    const passwordValida = await bcrypt.compare(password, user.password);
    if (!passwordValida) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }

    // BLOQUE 3: Crear JWT — sin incluir la contraseña en el payload
    const token = await createSessionToken({
      id: user.id,
      nombre: user.nombre,
      rol: user.rol,
      plan: user.plan,
    });

    const response = NextResponse.json({
      ok: true,
      usuario: { id: user.id, nombre: user.nombre, rol: user.rol, plan: user.plan },
    });

    // BLOQUE 3: Cookie HttpOnly + Secure + SameSite=Strict
    response.cookies.set("session", token, getSecureCookieOptions());

    return response;
  } catch (error) {
    // BLOQUE 5: Loguear internamente, respuesta genérica al cliente
    logger.error("POST /api/login", error);
    return NextResponse.json(serverErrorResponse(), { status: 500 });
  }
}