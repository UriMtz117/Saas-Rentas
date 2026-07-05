// app/api/login/recuperar/route.ts
import { prisma } from "../../../../lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";
import { logger, serverErrorResponse } from "../../../../lib/logger";

const recuperarSchema = z.object({
  email: z.string().trim().email().transform((v) => v.toLowerCase()),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = recuperarSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Correo inválido" }, { status: 400 });
    }

    const { email } = result.data;
    const usuario = await prisma.usuario.findUnique({ where: { email } });

    // BLOQUE 5: Siempre responder igual para no revelar si el email existe
    if (!usuario) {
      return NextResponse.json({
        ok: true,
        mensaje: "Si el correo existe, recibirás instrucciones.",
      });
    }

    // Aquí iría la lógica de envío de correo de recuperación
    logger.info("POST /api/login/recuperar", `Recuperación solicitada para: ${email}`);

    return NextResponse.json({
      ok: true,
      mensaje: "Si el correo existe, recibirás instrucciones.",
    });
  } catch (error) {
    logger.error("POST /api/login/recuperar", error);
    return NextResponse.json(serverErrorResponse(), { status: 500 });
  }
}