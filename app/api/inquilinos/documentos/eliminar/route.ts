import { prisma } from "../../../../../lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { inquilinoId, url } = await req.json();

    // 1. Buscamos al inquilino
    const inquilino = await prisma.inquilino.findUnique({
      where: { id: inquilinoId }
    });

    if (!inquilino) return NextResponse.json({ error: "No existe" }, { status: 404 });

    // 2. Filtramos el array para QUITAR el documento que tenga esa URL
    const docsActuales = Array.isArray(inquilino.documentos) ? (inquilino.documentos as any[]) : [];
    const nuevosDocs = docsActuales.filter(doc => doc.url !== url);

    // 3. Actualizamos la BD
    await prisma.inquilino.update({
      where: { id: inquilinoId },
      data: { documentos: nuevosDocs }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Error al eliminar de la BD" }, { status: 500 });
  }
}