// app/api/login/verificar/route.ts
import { prisma } from "../../../../lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get("uid");

    if (!uid) return NextResponse.json({ error: "No UID" }, { status: 400 });

    // Buscamos al usuario en la base de datos
    const user = await prisma.usuario.findUnique({
      where: { id: uid },
      select: { id: true, nombre: true, rol: true } // Solo datos necesarios
    });

    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}