import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const user = await prisma.usuario.findUnique({
      where: { email: email }
    });

    if (!user || user.password !== password) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }

    // Enviamos el ID y el ROL para que el frontend los guarde
    return NextResponse.json({ 
      user: { 
        id: user.id, 
        nombre: user.nombre, 
        rol: user.rol, 
        plan: user.plan 
      } 
    });

  } catch (error) {
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}