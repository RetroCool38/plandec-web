import type { Metadata } from "next";
import "./globals.css";
import SiteFrame from "@/components/layout/site-frame";
import ServiceWorkerRegister from "@/components/pwa/service-worker-register";

export const metadata: Metadata = {
  title: "PLANdeC",
  description:
    "Plataforma de inteligencia política, análisis estratégico y posicionamiento.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "PLANdeC", statusBarStyle: "black-translucent" },
  icons: {
    icon: [{ url: "/icon.png", type: "image/png" }],
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="min-h-screen text-[#2A2140] antialiased">
        <ServiceWorkerRegister />
        <SiteFrame>{children}</SiteFrame>
      </body>
    </html>
  );
}
