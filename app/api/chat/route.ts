import { prisma } from "../../../lib/prisma"; // 3 niveles hacia arriba
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const query = message.toLowerCase();

    // 1. Obtener datos de la base de datos
    const propiedades = await prisma.propiedad.findMany();
    const inquilinos = await prisma.inquilino.findMany({ include: { propiedad: true } });
    const pagos = await prisma.pago.findMany({ include: { inquilino: true } });

    // 2. Intentar usar Gemini
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `Eres un asistente de rentas. Datos: Propiedades: ${JSON.stringify(propiedades)}. Inquilinos: ${JSON.stringify(inquilinos)}. Pagos: ${JSON.stringify(pagos)}. Pregunta: ${message}`;
      
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return NextResponse.json({ reply: text });

    } catch (aiError) {
      console.log("IA no disponible, usando modo lógico.");
      
      // 3. MODO LÓGICO (Soluciona los errores de 'any')
      if (query.includes("propiedad") || query.includes("casa")) {
        return NextResponse.json({ reply: `🤖 [Asistente]: Tienes ${propiedades.length} propiedades. La última registrada es ${propiedades[0]?.nombre || "ninguna"}.` });
      }

      if (query.includes("pago") || query.includes("cuánto") || query.includes("dinero")) {
        // Corregimos los tipos de acc y p aquí:
        const total = pagos.reduce((acc: number, p: any) => acc + p.monto, 0);
        return NextResponse.json({ reply: `🤖 [Asistente]: Has recaudado un total de $${total}.` });
      }

      return NextResponse.json({ reply: "🤖 [Asistente]: No pude conectar con la IA de Google, pero puedo decirte que tu base de datos está lista. Prueba preguntando por tus casas o pagos." });
    }

  } catch (error) {
    return NextResponse.json({ reply: "Error de conexión." }, { status: 500 });
  }
}