// app/api/register/route.ts
import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

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
  console.log("ERROR DE VALIDACIÓN EN REGISTRO:", result.error.flatten());

  return NextResponse.json(
    {
      error: "Datos inválidos",
      detalles: result.error.flatten(),
    },
    { status: 400 }
  );
}

    const { nombre, email, password, rol } = result.data;

    const existe = await prisma.usuario.findUnique({
      where: { email },
    });

    if (existe) {
      return NextResponse.json(
        { error: "El usuario ya existe" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const nuevoUsuario = await prisma.usuario.create({
      data: {
        nombre,
        email,
        password: passwordHash,
        rol,
        plan: "BASICO",
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        plan: true,
        createdAt: true,
      },
    });

    return NextResponse.json(nuevoUsuario, { status: 201 });
  } catch (error) {
    console.error("Error en registro:", error);

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}