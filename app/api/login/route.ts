// app/api/login/route.ts
import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().trim().email().transform((v) => v.toLowerCase()),
  password: z.string().min(1),
});

function pareceHashBcrypt(passwordGuardada: string) {
  return passwordGuardada.startsWith("$2a$") ||
         passwordGuardada.startsWith("$2b$") ||
         passwordGuardada.startsWith("$2y$");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    const { email, password } = result.data;

    const user = await prisma.usuario.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    let passwordValida = false;

    if (pareceHashBcrypt(user.password)) {
      passwordValida = await bcrypt.compare(password, user.password);
    } else {
      // Compatibilidad temporal con usuarios antiguos guardados en texto plano
      passwordValida = user.password === password;

      // Si coincide, actualiza automáticamente la contraseña a hash seguro
      if (passwordValida) {
        const passwordHash = await bcrypt.hash(password, 12);

        await prisma.usuario.update({
          where: { id: user.id },
          data: { password: passwordHash },
        });
      }
    }

    if (!passwordValida) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        nombre: user.nombre,
        rol: user.rol,
        plan: user.plan,
      },
    });
  } catch (error) {
    console.error("ERROR REAL EN LOGIN:", error);

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}