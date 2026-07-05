// app/api/inquilinos/documentos/eliminar/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "../../../../../lib/auth";
import { logger, serverErrorResponse } from "../../../../../lib/logger";

const eliminarSchema = z.object({
  url: z.string().url().min(1),
  inquilinoId: z.string().min(1),
});

export async function DELETE(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const result = eliminarSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    // Aquí iría la lógica para eliminar de Supabase Storage
    // const { error } = await supabase.storage.from('documentos').remove([path])

    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error("DELETE /api/inquilinos/documentos/eliminar", error);
    return NextResponse.json(serverErrorResponse(), { status: 500 });
  }
}