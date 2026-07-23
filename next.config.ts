// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Genera una versión optimizada para ejecutarse en Docker
  output: "standalone",

  // BLOQUE 4: Headers de seguridad HTTP
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Previene que el navegador "adivine" el tipo MIME
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },

          // Previene Clickjacking
          {
            key: "X-Frame-Options",
            value: "DENY",
          },

          // Protección XSS del navegador
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },

          // Controla qué información del referrer se envía
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },

          // Restringe permisos de APIs del navegador
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(self), payment=()",
          },

          // Content Security Policy
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://*.supabase.co https://*.supabase.in",
              "connect-src 'self' https://*.supabase.co https://*.supabase.in",
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "*.supabase.in",
      },
    ],
  },
};

export default nextConfig;