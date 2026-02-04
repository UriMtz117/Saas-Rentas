// app/api/register/route.ts
import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nombre, email, password, rol } = body; // Recibimos el rol del formulario

    // 1. Verificamos si existe
    const existe = await prisma.usuario.findUnique({ where: { email } });
    if (existe) return NextResponse.json({ error: "Ya existe" }, { status: 400 });

    // 2. Creamos el usuario con el rol ELEGIDO (PROPIETARIO o INQUILINO)
    const nuevoUsuario = await prisma.usuario.create({
      data: {
        nombre,
        email,
        password,
        rol: rol, // <--- AQUÍ: Antes decía "USER", ahora usa lo que el usuario eligió
        plan: "BASICO"
      }
    });

    return NextResponse.json(nuevoUsuario);
  } catch (error) {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}