// app/api/chat/route.ts
import { prisma } from "../../../lib/prisma"; // 3 niveles hacia arriba: api <- chat <- app
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Inicializamos Google Generative AI con tu API Key del .env
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const query = message.toLowerCase();

    // 1. Obtener toda la información relevante de la base de datos (Supabase)
    const propiedades = await prisma.propiedad.findMany();
    const inquilinos = await prisma.inquilino.findMany({ include: { propiedad: true } });
    const pagos = await prisma.pago.findMany({ include: { inquilino: true } });
    const usuarios = await prisma.usuario.findMany();

    // 2. Intentar usar la Inteligencia Artificial de Google (Gemini)
    try {
      // Usamos gemini-1.5-flash que es rápido y estable
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const promptSistema = `
        Eres un asistente experto en gestión inmobiliaria para el SaaS "InmoGestion".
        Tu objetivo es ayudar al usuario con datos precisos de su base de datos.
        
        CONTEXTO ACTUAL DEL NEGOCIO:
        - PROPIEDADES REGISTRADAS: ${JSON.stringify(propiedades)}
        - INQUILINOS Y CONTRATOS (fechaFin es el vencimiento): ${JSON.stringify(inquilinos)}
        - HISTORIAL DE PAGOS: ${JSON.stringify(pagos)}
        - USUARIOS DEL SAAS Y SUS PLANES: ${JSON.stringify(usuarios)}

        REGLAS DE RESPUESTA:
        1. Responde de forma breve, profesional y amable.
        2. Si preguntan por deudas, busca en los pagos con estado "PENDIENTE".
        3. Si preguntan por contratos, revisa la fecha "fechaFin" de los inquilinos.
        4. Si preguntan por planes, menciona si el usuario es plan "BASICO" o "ORO".
        5. Habla siempre en primera persona como un asistente inteligente.
      `;

      const result = await model.generateContent(`${promptSistema}\n\nPregunta del usuario: ${message}`);
      const text = result.response.text();
      
      return NextResponse.json({ reply: text });

    } catch (aiError) {
      // --- MODO LÓGICO DE RESPALDO (Si la API de Google falla) ---
      console.warn("IA de Google no disponible. Entrando en modo lógico.");

      // Lógica para Propiedades
      if (query.includes("propiedad") || query.includes("casa") || query.includes("cuánto") && query.includes("tengo")) {
        return NextResponse.json({ 
          reply: `🤖 [Modo Lógico]: Tienes ${propiedades.length} propiedades registradas. La unidad más reciente es "${propiedades[0]?.nombre || 'ninguna'}".` 
        });
      }

      // Lógica para Pagos y Dinero
      if (query.includes("pago") || query.includes("dinero") || query.includes("ganado") || query.includes("recaudado")) {
        const total = pagos.reduce((acc: number, p: any) => acc + p.monto, 0);
        const pendientes = pagos.filter((p: any) => p.estado === "PENDIENTE").length;
        return NextResponse.json({ 
          reply: `🤖 [Modo Lógico]: Has recaudado un total de $${total.toLocaleString()}. Actualmente hay ${pendientes} pagos marcados como pendientes.` 
        });
      }

      // Lógica para Contratos (Nueva funcionalidad)
      if (query.includes("contrato") || query.includes("vence") || query.includes("vencimiento")) {
        const proximos = inquilinos.filter((i: any) => i.fechaFin).length;
        return NextResponse.json({ 
          reply: `🤖 [Modo Lógico]: Gestionas ${proximos} contratos con fecha de vencimiento definida. Puedes ver los detalles en la sección de Inquilinos.` 
        });
      }

      // Lógica para Usuarios y Planes (Nueva funcionalidad)
      if (query.includes("plan") || query.includes("usuario") || query.includes("suscripción")) {
        return NextResponse.json({ 
          reply: `🤖 [Modo Lógico]: Hay ${usuarios.length} usuarios en el sistema. El plan estándar actual es "BASICO".` 
        });
      }

      return NextResponse.json({ 
        reply: "🤖 [Modo Lógico]: Recibí tu mensaje. Puedo darte información sobre tus propiedades, inquilinos, contratos y pagos. ¿En qué área específica necesitas ayuda?" 
      });
    }

  } catch (error) {
    console.error("Error crítico en la API de Chat:", error);
    return NextResponse.json({ reply: "Error de conexión con el servidor de datos." }, { status: 500 });
  }
}