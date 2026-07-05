// lib/logger.ts
// BLOQUE 5: Logger centralizado — detalles solo en servidor, nunca al cliente

const isProduction = process.env.NODE_ENV === "production";

export const logger = {
  /** Registra errores internamente. En producción solo loguea, no expone al cliente. */
  error(context: string, error: unknown) {
    if (!isProduction) {
      console.error(`[ERROR] [${context}]`, error);
    } else {
      // En producción: log genérico sin stack trace
      console.error(`[ERROR] [${context}]`, error instanceof Error ? error.message : "Unknown error");
    }
  },

  info(context: string, message: string) {
    console.log(`[INFO] [${context}] ${message}`);
  },

  warn(context: string, message: string) {
    console.warn(`[WARN] [${context}] ${message}`);
  },
};

/** Respuesta de error genérica para el cliente (BLOQUE 5) */
export function serverErrorResponse() {
  return { error: "Ocurrió un error interno en el servidor" };
}