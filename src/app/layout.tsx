import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "La Patrona | Mostrador de Ventas y Contabilidad",
  description: "Punto de venta POS y contabilidad diaria, semanal y mensual para La Patrona (Philly & Fry)",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "La Patrona POS",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0d0d0f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es-MX"
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} h-full antialiased dark`}
    >
      <body className="min-h-full bg-[#0d0d0f] text-[#f5f0eb] flex flex-col font-sans selection:bg-[#e59b38] selection:text-black touch-manipulation">
        {children}
      </body>
    </html>
  );
}
