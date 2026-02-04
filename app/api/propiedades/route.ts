import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";

// MÉTODO GET: Listado inteligente de propiedades
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get("uid");

    if (!uid || uid === "undefined" || uid === "null") {
      return NextResponse.json({ error: "Sesión no válida" }, { status: 400 });
    }

    // 1. Buscamos el rol del usuario que hace la petición
    const user = await prisma.usuario.findUnique({ where: { id: uid } });

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    // 2. DEFINIMOS QUÉ PUEDE VER SEGÚN SU ROL
    let filter = {};

    if (user.rol === "PROPIETARIO") {
      // Propietario: Solo ve sus propios activos
      filter = { usuarioId: uid };
    } else if (user.rol === "INQUILINO") {
      // Inquilino: Solo ve las propiedades donde él tiene un contrato activo
      filter = {
        inquilinos: {
          some: {
            usuarioId: uid
          }
        }
      };
    } else if (user.rol === "ADMIN") {
      // Admin: Ve todo el inventario global
      filter = {};
    }

    const propiedades = await prisma.propiedad.findMany({
      where: filter,
      orderBy: { nombre: 'asc' }
    });

    return NextResponse.json(propiedades);

  } catch (error: any) {
    console.error("Error en API Propiedades:", error.message);
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}

// MÉTODO POST: Registro de propiedades nuevas (Solo para Dueños/Admin)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nombre, tipo, direccion, precio, usuarioId, fotos, lat, lng } = body;

    const nueva = await prisma.propiedad.create({
      data: {
        nombre,
        tipo,
        direccion,
        precio: parseFloat(precio),
        usuarioId,
        fotos: fotos || [],
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null,
      }
    });

    return NextResponse.json(nueva);
  } catch (error) {
    return NextResponse.json({ error: "Fallo al crear" }, { status: 500 });
  }
}