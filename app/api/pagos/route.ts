// app/api/pagos/route.ts

import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { getSession } from "../../../lib/auth";
import { logger, serverErrorResponse } from "../../../lib/logger";

const pagoSchema = z.object({
  /*
   * Puede recibirse el ID del perfil Inquilino o el ID de su Usuario.
   * El código verifica ambas posibilidades.
   */
  inquilinoId: z.string().min(1, "El inquilino es obligatorio"),

  propiedadId: z.string().min(1, "La propiedad es obligatoria"),

  monto: z
    .number()
    .positive("El monto debe ser mayor que cero")
    .max(1_000_000, "El monto excede el límite permitido"),

  mesPagado: z
    .string()
    .min(1, "El mes pagado es obligatorio")
    .max(20, "El mes pagado no es válido"),

  estado: z
    .enum(["PENDIENTE", "PAGADO", "ATRASADO"])
    .default("PAGADO"),

  /*
   * Tu modelo Inquilino exige teléfono.
   * Es opcional en la petición porque un perfil ya existente no lo necesita.
   */
  telefono: z.string().max(30).optional(),
});

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    let where: Prisma.PagoWhereInput = {};

    if (session.rol === "PROPIETARIO") {
      where = {
        inquilino: {
          propiedad: {
            usuarioId: session.id,
          },
        },
      };
    }

    if (session.rol === "INQUILINO") {
      where = {
        inquilino: {
          usuarioId: session.id,
        },
      };
    }

    const pagos = await prisma.pago.findMany({
      where,
      include: {
        inquilino: {
          include: {
            propiedad: true,
          },
        },
      },

      /*
       * Pago no tiene createdAt.
       * El campo de fecha disponible es fechaPago.
       */
      orderBy: {
        fechaPago: "desc",
      },
    });

    return NextResponse.json({ pagos });
  } catch (error) {
    logger.error("GET /api/pagos", error);

    return NextResponse.json(
      serverErrorResponse(),
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const result = pagoSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Datos inválidos",
          detalles: result.error.flatten(),
        },
        { status: 400 }
      );
    }

    const {
      inquilinoId,
      propiedadId,
      monto,
      mesPagado,
      estado,
      telefono,
    } = result.data;

    /*
     * Verificar que la propiedad exista.
     */
    const propiedad = await prisma.propiedad.findUnique({
      where: {
        id: propiedadId,
      },
      select: {
        id: true,
        usuarioId: true,
      },
    });

    if (!propiedad) {
      return NextResponse.json(
        { error: "La propiedad no existe" },
        { status: 404 }
      );
    }

    /*
     * Un propietario solamente puede registrar pagos para
     * propiedades que le pertenecen.
     */
    if (
      session.rol === "PROPIETARIO" &&
      propiedad.usuarioId !== session.id
    ) {
      return NextResponse.json(
        {
          error:
            "No tienes permiso para registrar pagos en esta propiedad",
        },
        { status: 403 }
      );
    }

    /*
     * Primero se intenta localizar el perfil por:
     * 1. ID directo del Inquilino.
     * 2. ID de la cuenta Usuario vinculada.
     */
    let perfil = await prisma.inquilino.findFirst({
      where: {
        OR: [
          {
            id: inquilinoId,
          },
          {
            usuarioId: inquilinoId,
          },
        ],
      },
    });

    /*
     * Si no existe el perfil, se busca la cuenta Usuario
     * para crear automáticamente su perfil de Inquilino.
     */
    if (!perfil) {
      const usuario = await prisma.usuario.findUnique({
        where: {
          id: inquilinoId,
        },
      });

      if (!usuario) {
        return NextResponse.json(
          { error: "Inquilino no encontrado" },
          { status: 404 }
        );
      }

      /*
       * Evita intentar crear un correo duplicado.
       */
      const perfilConMismoCorreo =
        await prisma.inquilino.findUnique({
          where: {
            correo: usuario.email,
          },
        });

      if (perfilConMismoCorreo) {
        perfil = perfilConMismoCorreo;
      } else {
        perfil = await prisma.inquilino.create({
          data: {
            usuarioId: usuario.id,
            propiedadId,
            nombre: usuario.nombre,
            correo: usuario.email,

            /*
             * telefono es obligatorio en schema.prisma.
             * Cuando no venga en la petición se almacena temporalmente
             * como "No registrado".
             */
            telefono: telefono?.trim() || "No registrado",

            activo: true,

            /*
             * Prisma acepta objetos Date directamente.
             */
            fechaInicio: new Date(),

            fechaFin: new Date(
              Date.now() + 365 * 24 * 60 * 60 * 1000
            ),

            /*
             * No se agrega montoRenta porque ese campo
             * no existe en el modelo Inquilino.
             */
          },
        });
      }
    }

    /*
     * Evita registrar el pago en una propiedad diferente
     * a la que tiene asignada el inquilino.
     */
    if (perfil.propiedadId !== propiedadId) {
      return NextResponse.json(
        {
          error:
            "El inquilino no está asignado a la propiedad seleccionada",
        },
        { status: 400 }
      );
    }

    /*
     * Un usuario con rol INQUILINO únicamente puede
     * registrar pagos sobre su propio perfil.
     */
    if (
      session.rol === "INQUILINO" &&
      perfil.usuarioId !== session.id
    ) {
      return NextResponse.json(
        {
          error:
            "No puedes registrar pagos para otro inquilino",
        },
        { status: 403 }
      );
    }

    /*
     * El monto se guarda en Pago.monto.
     */
    const pago = await prisma.pago.create({
      data: {
        inquilinoId: perfil.id,
        monto,
        mesPagado,
        estado,
      },
      include: {
        inquilino: {
          include: {
            propiedad: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        mensaje: "Pago registrado correctamente",
        pago,
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error("POST /api/pagos", error);

    return NextResponse.json(
      serverErrorResponse(),
      { status: 500 }
    );
  }
}