"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Container from "@/components/ui/container";

const navLinks = [
  { label: "Inicio", href: "/" },
  { label: "Nosotros", href: "/nosotros" },
  { label: "Soluciones", href: "/soluciones" },
  { label: "Noticias", href: "/noticias" },
  {
    label: "País",
    href: "/pais",
    children: [
      { label: "Colombia", href: "/pais/colombia" },
      { label: "Panamá", href: "/pais/panama" },
      { label: "Países Bajos", href: "/pais/paises-bajos" },
    ],
  },
  { label: "Contacto", href: "/contacto" },
];

export default function Navbar() {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenDropdown(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0B1020]/90 backdrop-blur-md">
      <Container className="flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center">
  <img
    src="/logo333.png"
    alt="PLANdeC"
    className="h-10 w-auto object-contain"
  />
</Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => {
            const hasChildren =
              "children" in link && Array.isArray(link.children);

            if (!hasChildren) {
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-white/80 transition hover:text-white"
                >
                  {link.label}
                </Link>
              );
            }

            return (
              <div key={link.label} className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() =>
                    setOpenDropdown(openDropdown === link.label ? null : link.label)
                  }
                  className="flex items-center gap-2 text-sm font-medium text-white/80 transition hover:text-white"
                >
                  {link.label}
                  <span
                    className={`text-xs transition ${
                      openDropdown === link.label ? "rotate-180" : ""
                    }`}
                  >
                    ▼
                  </span>
                </button>

                {openDropdown === link.label && (
                  <div className="absolute left-0 top-full mt-2 min-w-[220px] overflow-hidden rounded-2xl border border-white/10 bg-[#0B1020] shadow-2xl">
                    <div className="p-2">
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setOpenDropdown(null)}
                          className="block rounded-xl px-4 py-3 text-sm text-white/80 transition hover:bg-white/5 hover:text-white"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <Link
          href="/login"
          className="rounded-full border border-[#5A2D82] bg-[#5A2D82] px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Ingresar
        </Link>
      </Container>
    </header>
  );
}