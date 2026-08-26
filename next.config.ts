import type { NextConfig } from "next";
import { SECURITY_HEADERS } from "./security-headers";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Restricciones de imágenes: solo el dominio propio sin fuentes externas.
  images: {
    remotePatterns: [],
  },

  // Cabeceras de seguridad para respuestas del servidor.
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          ...SECURITY_HEADERS,
        ],
      },
    ];
  },
};

export default nextConfig;
