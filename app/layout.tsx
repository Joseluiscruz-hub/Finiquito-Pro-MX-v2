import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./print-receipt.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://finiquito-pro-mx-v2.example";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0d1b36",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Finiquito Pro MX | Calculadora laboral corporativa 2026",
  description:
    "Calcula finiquitos y liquidaciones en México con desglose auditable, supuestos visibles, recibo imprimible y parámetros laborales 2026.",
  openGraph: {
    title: "Finiquito Pro MX",
    description: "Cálculo laboral corporativo con desglose auditable.",
    type: "website",
    locale: "es_MX",
    url: siteUrl,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Finiquito Pro MX" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Finiquito Pro MX",
    description: "Cálculo laboral corporativo con desglose auditable.",
    images: ["/og.png"],
  },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-MX">
      <body>{children}</body>
    </html>
  );
}
