// lib/auth.ts
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

// BLOQUE 3: Secret desde variables de entorno, tokens expiran en 1h
const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export type SessionPayload = {
  id: string;
  nombre: string;
  rol: string;
  plan: string;
};

/** Crea JWT firmado con expiración de 1 hora */
export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secret);
}

/** Verifica firma y expiración del JWT */
export async function verifySessionToken(token: string): Promise<SessionPayload> {
  const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
  return payload as unknown as SessionPayload;
}

/** Extrae y valida la sesión desde la cookie HttpOnly del request */
export async function getSessionFromRequest(req: NextRequest): Promise<SessionPayload | null> {
  try {
    const token = req.cookies.get("session")?.value;
    if (!token) return null;
    return await verifySessionToken(token);
  } catch {
    return null; // Token inválido o expirado — no revelar detalles
  }
}

/** Para uso en Server Components / Route Handlers */
export async function getSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    if (!token) return null;
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

/** BLOQUE 3: Atributos seguros para la cookie de sesión */
export function getSecureCookieOptions() {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,           // Previene lectura vía JavaScript
    secure: isProduction,     // Solo HTTPS en producción
    sameSite: "strict" as const, // Protección contra CSRF
    maxAge: 60 * 60,          // 1 hora
    path: "/",
  };
}