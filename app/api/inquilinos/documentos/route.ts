import { prisma } from "../../../../lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { inquilinoId, url, nombre } = await req.json();

    // 1. Buscamos al inquilino
    const inquilino = await prisma.inquilino.findUnique({
      where: { id: inquilinoId }
    });

    // 2. Extraemos lo que ya tiene (si es un array)
    const docsActuales = Array.isArray(inquilino?.documentos) ? (inquilino.documentos as any[]) : [];
    
    // 3. Agregamos el nuevo link
    const nuevosDocs = [...docsActuales, { nombre, url, fecha: new Date() }];

    // 4. Actualizamos la base de datos
    await prisma.inquilino.update({
      where: { id: inquilinoId },
      data: { documentos: nuevosDocs }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Fallo en la BD" }, { status: 500 });
  }
}