"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import ChatWidget from "@/components/ai/ChatWidget";

export default function SiteFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const fieldMode = pathname.startsWith("/campana/campo");

  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      {!fieldMode && <Navbar />}
      <main className="flex-1 bg-transparent">{children}</main>
      {!fieldMode && <Footer />}
      {!fieldMode && <ChatWidget />}
    </div>
  );
}
