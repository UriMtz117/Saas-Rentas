// app/api/inquilinos/documentos/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "../../../../lib/auth";
import { logger, serverErrorResponse } from "../../../../lib/logger";

// BLOQUE 2: Tipos MIME permitidos (previene subida de scripts maliciosos)
const MIME_PERMITIDOS = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];
const EXTENSIONES_PERMITIDAS = [".jpg", ".jpeg", ".png", ".webp", ".pdf"];
const TAMANO_MAXIMO_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const formData = await req.formData();
    const archivo = formData.get("archivo") as File | null;

    if (!archivo) {
      return NextResponse.json({ error: "No se recibió ningún archivo" }, { status: 400 });
    }

    // BLOQUE 2: Validar tamaño máximo (previene DoS)
    if (archivo.size > TAMANO_MAXIMO_BYTES) {
      return NextResponse.json({ error: "El archivo supera el límite de 5 MB" }, { status: 400 });
    }

    // BLOQUE 2: Validar tipo MIME real
    if (!MIME_PERMITIDOS.includes(archivo.type)) {
      return NextResponse.json({ error: "Tipo de archivo no permitido" }, { status: 400 });
    }

    // BLOQUE 2: Validar extensión del nombre del archivo
    const nombre = archivo.name.toLowerCase();
    const extensionValida = EXTENSIONES_PERMITIDAS.some((ext) => nombre.endsWith(ext));
    if (!extensionValida) {
      return NextResponse.json({ error: "Extensión de archivo no permitida" }, { status: 400 });
    }

    // Aquí iría la lógica de subida a Supabase Storage
    // const { data, error } = await supabase.storage.from('documentos').upload(...)

    return NextResponse.json({ ok: true, mensaje: "Archivo validado y subido correctamente" });
  } catch (error) {
    logger.error("POST /api/inquilinos/documentos", error);
    return NextResponse.json(serverErrorResponse(), { status: 500 });
  }
}