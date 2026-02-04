import { prisma } from "../../../../lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { contratoId, firmaImg } = await req.json();
  const actualizado = await prisma.contrato.update({
    where: { id: contratoId },
    data: { 
      firmado: true, 
      firmaImg: firmaImg, 
      fechaFirma: new Date() 
    }
  });
  return NextResponse.json(actualizado);
}