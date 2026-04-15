// app/api/login/recuperar/route.ts
import { prisma } from "../../../../lib/prisma"; // Ruta para estructura sin carpeta src
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // 1. CAPTURAMOS EL CORREO DEL CUERPO DE LA PETICIÓN
    const body = await req.json();
    const { email } = body;

    // VALIDACIÓN BÁSICA DE ENTRADA
    if (!email) {
      return NextResponse.json(
        { error: "El campo de correo electrónico es obligatorio." },
        { status: 400 }
      );
    }

    // 2. BUSCAMOS AL USUARIO EN LA BASE DE DATOS (SUPABASE)
    const usuario = await prisma.usuario.findUnique({
      where: { 
        email: email.toLowerCase().trim() 
      },
      select: { 
        id: true, 
        nombre: true 
      }
    });

    // 3. LÓGICA DE SIMULACIÓN DE ENVÍO
    if (usuario) {
      // En un entorno de producción, aquí generaríamos un Token JWT
      // y lo enviaríamos por correo usando Nodemailer o SendGrid.
      console.log(`[SISTEMA DE SEGURIDAD]: Generando ticket de recuperación para ${usuario.nombre} (${email})`);
      
      // Simulamos una demora de red para que la experiencia sea real
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // 4. RESPUESTA DE SEGURIDAD (ANTI-ENUMERACIÓN)
    // Siempre devolvemos éxito para que un atacante no sepa si el correo existe o no.
    return NextResponse.json({
      success: true,
      mensaje: "Si el correo electrónico proporcionado está registrado en nuestra base de datos, recibirá un enlace de restablecimiento en breve."
    });

  } catch (error: any) {
    console.error("ERROR CRÍTICO EN API RECUPERAR:", error.message);
    
    return NextResponse.json(
      { error: "Hubo un fallo interno al procesar la solicitud de recuperación." },
      { status: 500 }
    );
  }
}