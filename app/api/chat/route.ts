// app/api/chat/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "../../../lib/auth";
import { logger, serverErrorResponse } from "../../../lib/logger";
import { GoogleGenerativeAI } from "@google/generative-ai";

// BLOQUE 2: Validación del mensaje del chat
const chatSchema = z.object({
  mensaje: z.string().trim().min(1).max(2000),
  historial: z
    .array(
      z.object({
        role: z.enum(["user", "model"]),
        parts: z.array(z.object({ text: z.string().max(2000) })),
      })
    )
    .max(20)
    .optional()
    .default([]),
});

export async function POST(req: Request) {
  try {
    // BLOQUE 3: Verificar sesión
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const result = chatSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: "Mensaje inválido" }, { status: 400 });
    }

    const { mensaje, historial } = result.data;

    // BLOQUE 1: API Key desde variable de entorno, nunca hardcodeada
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const chat = model.startChat({ history: historial });
    const resultado = await chat.sendMessage(mensaje);

    return NextResponse.json({ respuesta: resultado.response.text() });
  } catch (error) {
    logger.error("POST /api/chat", error);
    return NextResponse.json(serverErrorResponse(), { status: 500 });
  }
}