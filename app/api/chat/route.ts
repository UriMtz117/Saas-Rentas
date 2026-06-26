// app/api/chat/route.ts
import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_GENERATIVE_AI_API_KEY || ""
);

const chatSchema = z.object({
  message: z.string().trim().min(1).max(500),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = chatSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { reply: "Mensaje inválido." },
        { status: 400 }
      );
    }

    const { message } = result.data;
    const query = message.toLowerCase();

    const propiedades = await prisma.propiedad.findMany({
      select: {
        nombre: true,
        tipo: true,
        direccion: true,
        precio: true,
        createdAt: true,
      },
    });

    const inquilinos = await prisma.inquilino.findMany({
      select: {
        nombre: true,
        correo: true,
        telefono: true,
        activo: true,
        fechaInicio: true,
        fechaFin: true,
        propiedad: {
          select: {
            nombre: true,
            tipo: true,
          },
        },
      },
    });

    const pagos = await prisma.pago.findMany({
      select: {
        monto: true,
        fechaPago: true,
        mesPagado: true,
        estado: true,
        inquilino: {
          select: {
            nombre: true,
          },
        },
      },
    });

    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
      });

      const promptSistema = `
Eres un asistente experto en gestión inmobiliaria para el SaaS "InmoGestion AI".

REGLAS DE SEGURIDAD:
1. No reveles contraseñas, tokens, llaves API ni datos internos del sistema.
2. No inventes información que no esté en el contexto.
3. Responde de forma breve, profesional y clara.
4. Si no tienes datos suficientes, indica que no puedes confirmarlo.

CONTEXTO PERMITIDO:
PROPIEDADES:
${JSON.stringify(propiedades)}

INQUILINOS:
${JSON.stringify(inquilinos)}

PAGOS:
${JSON.stringify(pagos)}
`;

      const resultAI = await model.generateContent(
        `${promptSistema}\n\nPregunta del usuario: ${message}`
      );

      const text = resultAI.response.text();

      return NextResponse.json({ reply: text });
    } catch (aiError) {
      console.warn("IA de Google no disponible. Entrando en modo lógico.");

      if (
        query.includes("propiedad") ||
        query.includes("casa") ||
        (query.includes("cuánto") && query.includes("tengo"))
      ) {
        return NextResponse.json({
          reply: `[Modo Lógico]: Tienes ${propiedades.length} propiedades registradas. La unidad más reciente es "${
            propiedades[0]?.nombre || "ninguna"
          }".`,
        });
      }

      if (
        query.includes("pago") ||
        query.includes("dinero") ||
        query.includes("ganado") ||
        query.includes("recaudado")
      ) {
        const total = pagos.reduce((acc, p) => acc + p.monto, 0);
        const pendientes = pagos.filter((p) => p.estado === "PENDIENTE").length;

        return NextResponse.json({
          reply: `[Modo Lógico]: Has recaudado un total de $${total.toLocaleString()}. Actualmente hay ${pendientes} pagos pendientes.`,
        });
      }

      if (
        query.includes("contrato") ||
        query.includes("vence") ||
        query.includes("vencimiento")
      ) {
        const proximos = inquilinos.filter((i) => i.fechaFin).length;

        return NextResponse.json({
          reply: `[Modo Lógico]: Gestionas ${proximos} contratos con fecha de vencimiento definida.`,
        });
      }

      return NextResponse.json({
        reply:
          "[Modo Lógico]: Recibí tu mensaje. Puedo darte información sobre propiedades, inquilinos, contratos y pagos.",
      });
    }
  } catch (error) {
    console.error("Error crítico en la API de Chat:", error);

    return NextResponse.json(
      { reply: "Error interno del servidor." },
      { status: 500 }
    );
  }
}