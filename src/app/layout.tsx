import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import ChatWidget from "@/components/ai/ChatWidget";

export const metadata: Metadata = {
  title: "PLANdeC",
  description:
    "Plataforma de inteligencia política, análisis estratégico y posicionamiento.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="min-h-screen text-[#2A2140] antialiased">
       <div className="flex min-h-screen flex-col bg-transparent">
          <Navbar />
         <main className="flex-1 bg-transparent">{children}</main>
          <Footer />
          <ChatWidget />
        </div>
      </body>
    </html>
  );
}