// app/api/explorar/route.ts
import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    
    // 1. CAPTURA Y LIMPIEZA DE DATOS
    const q = searchParams.get("q")?.slice(0, 50) || ""; 
    const tipo = searchParams.get("tipo") || "TODOS";
    const min = parseFloat(searchParams.get("min") || "0");
    const max = parseFloat(searchParams.get("max") || "999999");
    const sort = searchParams.get("sort") || "newest";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = 6; 
    const skip = (page - 1) * limit;

    // 2. VALIDACIÓN DE ERRORES (Punto 4 de la rúbrica)
    if (min > max && max !== 0) {
      return NextResponse.json({ error: "El rango de precio es inválido (Mínimo > Máximo)" }, { status: 400 });
    }

    // 3. CONSTRUCCIÓN DE QUERY DINÁMICA
    const whereClause: any = {
      precio: { gte: min, lte: max > 0 ? max : 999999 },
      OR: q ? [
        { nombre: { contains: q, mode: 'insensitive' } },
        { direccion: { contains: q, mode: 'insensitive' } }
      ] : undefined
    };
    if (tipo !== "TODOS") whereClause.tipo = tipo;

    // 4. LÓGICA DE ORDENAMIENTO (Fecha y Precio)
    let orderBy: any = {};
    if (sort === "newest") orderBy = { createdAt: 'desc' };
    if (sort === "oldest") orderBy = { createdAt: 'asc' };
    if (sort === "price_asc") orderBy = { precio: 'asc' };
    if (sort === "price_desc") orderBy = { precio: 'desc' };

    // 5. CONSULTA SIMULTÁNEA (Total e Items)
    const [total, propiedades] = await Promise.all([
      prisma.propiedad.count({ where: whereClause }),
      prisma.propiedad.findMany({
        where: whereClause,
        skip: skip,
        take: limit,
        orderBy: orderBy
      })
    ]);

    return NextResponse.json({
      items: propiedades,
      total: total,
      page,
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}