import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { inquilinoId, cuerpo, firmaOwner, firmadoOwner } = body;

    // 1. Guardamos el contrato (usamos 'as any' para evitar bloqueos de tipos temporales)
    const contrato = await (prisma.contrato as any).upsert({
      where: { inquilinoId: inquilinoId },
      update: { 
        cuerpo: cuerpo, 
        firmaOwner: firmaOwner, 
        firmadoOwner: firmadoOwner, 
        firmado: false 
      },
      create: { 
        inquilinoId: inquilinoId, 
        cuerpo: cuerpo, 
        firmaOwner: firmaOwner, 
        firmadoOwner: firmadoOwner 
      }
    });

    // 2. Buscamos al usuario vinculado para notificarle
    const inquilino = await prisma.inquilino.findUnique({
      where: { id: inquilinoId },
      select: { usuarioId: true }
    });

    if (inquilino?.usuarioId) {
      await (prisma.notificacion as any).create({
        data: {
          usuarioId: inquilino.usuarioId,
          mensaje: "Tienes un nuevo contrato pendiente de firma 🖋️",
          tipo: "CONTRATO"
        }
      });
    }

    return NextResponse.json(contrato);
  } catch (error: any) {
    console.error("ERROR EN API CONTRATOS:", error.message);
    return NextResponse.json({ error: "Fallo al procesar" }, { status: 500 });
  }
}