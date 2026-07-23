// app/api/propiedades/rentar/route.ts

import { prisma } from "../../../../lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "../../../../lib/auth";
import { logger, serverErrorResponse } from "../../../../lib/logger";

const rentarSchema = z
  .object({
    propiedadId: z.string().min(1, "La propiedad es obligatoria"),

    inquilinoId: z.string().min(1, "El inquilino es obligatorio"),

    // Convierte automáticamente el texto recibido a Date
    fechaInicio: z.coerce.date({
      error: "La fecha de inicio no es válida",
    }),

    fechaFin: z.coerce.date({
      error: "La fecha final no es válida",
    }),

    montoRenta: z
      .number()
      .positive("El monto de renta debe ser mayor a cero")
      .max(1_000_000, "El monto de renta excede el límite permitido"),

    /*
     * Usuario no tiene teléfono en tu schema.
     * Se permite enviarlo desde el formulario.
     */
    telefono: z
      .string()
      .trim()
      .min(7, "El teléfono debe contener al menos 7 caracteres")
      .max(30, "El teléfono es demasiado largo")
      .optional(),
  })
  .refine((datos) => datos.fechaFin > datos.fechaInicio, {
    message: "La fecha final debe ser posterior a la fecha de inicio",
    path: ["fechaFin"],
  });

export async function POST(req: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    if (
      session.rol !== "PROPIETARIO" &&
      session.rol !== "ADMIN"
    ) {
      return NextResponse.json(
        { error: "Acceso denegado" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const result = rentarSchema.safeParse(body);

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
      propiedadId,
      inquilinoId,
      fechaInicio,
      fechaFin,
      montoRenta,
      telefono,
    } = result.data;

    /*
     * Comprobar que la propiedad exista.
     */
    const propiedad = await prisma.propiedad.findUnique({
      where: {
        id: propiedadId,
      },
      select: {
        id: true,
        nombre: true,
        usuarioId: true,
        precio: true,
      },
    });

    if (!propiedad) {
      return NextResponse.json(
        { error: "Propiedad no encontrada" },
        { status: 404 }
      );
    }

    /*
     * El propietario solamente puede rentar
     * propiedades que le pertenecen.
     */
    if (
      session.rol === "PROPIETARIO" &&
      propiedad.usuarioId !== session.id
    ) {
      return NextResponse.json(
        {
          error:
            "No tienes permiso para administrar esta propiedad",
        },
        { status: 403 }
      );
    }

    /*
     * inquilinoId recibido representa el ID de Usuario.
     * Se consulta para obtener nombre y correo, que son
     * obligatorios en el modelo Inquilino.
     */
    const usuarioInquilino =
      await prisma.usuario.findUnique({
        where: {
          id: inquilinoId,
        },
        select: {
          id: true,
          nombre: true,
          email: true,
        },
      });

    if (!usuarioInquilino) {
      return NextResponse.json(
        {
          error:
            "No se encontró la cuenta del inquilino seleccionado",
        },
        { status: 404 }
      );
    }

    /*
     * Buscar un perfil existente por usuarioId o correo.
     * Esto evita errores por el campo correo @unique.
     */
    const perfilExistente =
      await prisma.inquilino.findFirst({
        where: {
          OR: [
            {
              usuarioId: usuarioInquilino.id,
            },
            {
              correo: usuarioInquilino.email,
            },
          ],
        },
      });

    /*
     * Evita vincular un perfil que ya pertenece
     * a una cuenta de usuario distinta.
     */
    if (
      perfilExistente?.usuarioId &&
      perfilExistente.usuarioId !== usuarioInquilino.id
    ) {
      return NextResponse.json(
        {
          error:
            "Ya existe un perfil de inquilino con ese correo vinculado a otra cuenta",
        },
        { status: 409 }
      );
    }

    /*
     * La operación se ejecuta en una transacción:
     *
     * 1. montoRenta se guarda como Propiedad.precio.
     * 2. Se crea o actualiza el perfil Inquilino.
     *
     * montoRenta no puede almacenarse directamente
     * en Inquilino porque ese campo no existe.
     */
    const inquilino = await prisma.$transaction(
      async (tx) => {
        await tx.propiedad.update({
          where: {
            id: propiedadId,
          },
          data: {
            precio: montoRenta,
          },
        });

        if (perfilExistente) {
          return tx.inquilino.update({
            where: {
              id: perfilExistente.id,
            },
            data: {
              usuarioId: usuarioInquilino.id,
              propiedadId,
              nombre: usuarioInquilino.nombre,
              correo: usuarioInquilino.email,

              /*
               * Conserva el teléfono anterior si
               * no se envía uno nuevo.
               */
              telefono:
                telefono?.trim() ||
                perfilExistente.telefono,

              fechaInicio,
              fechaFin,
              activo: true,
            },
            include: {
              propiedad: true,
              usuario: true,
            },
          });
        }

        return tx.inquilino.create({
          data: {
            usuarioId: usuarioInquilino.id,
            propiedadId,
            nombre: usuarioInquilino.nombre,
            correo: usuarioInquilino.email,

            /*
             * Tu modelo exige un teléfono.
             * Si el formulario no lo envía, se usa
             * temporalmente "No registrado".
             */
            telefono:
              telefono?.trim() || "No registrado",

            fechaInicio,
            fechaFin,
            activo: true,
          },
          include: {
            propiedad: true,
            usuario: true,
          },
        });
      }
    );

    return NextResponse.json(
      {
        mensaje: "Propiedad rentada correctamente",
        inquilino,
        montoRenta,
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error(
      "POST /api/propiedades/rentar",
      error
    );

    return NextResponse.json(
      serverErrorResponse(),
      { status: 500 }
    );
  }
}