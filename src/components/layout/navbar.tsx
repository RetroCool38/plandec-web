"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Container from "@/components/ui/container";

type NavChild = {
  label: string;
  href: string;
};

type NavItem = {
  label: string;
  href: string;
  children?: NavChild[];
};

const navLinks: NavItem[] = [
  { label: "Inicio", href: "/" },
  { label: "Nosotros", href: "/nosotros" },
  { label: "Soluciones", href: "/soluciones" },
  { label: "Campaña", href: "/campana" },
  { label: "Inteligencia electoral", href: "/inteligencia-electoral", children: [
    { label: "Mapa electoral", href: "/inteligencia-electoral" },
    { label: "Dashboard y tendencias", href: "/inteligencia-electoral/dashboard" },
  ] },
  {
    label: "Noticias",
    href: "/noticias",
    children: [
      { label: "Noticias por país", href: "/noticias" },
      { label: "Edición de noticias", href: "/noticias/editar" },
    ],
  },
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
  const navRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-[#E8E0EC] bg-white/95 shadow-sm backdrop-blur-md">
      <Container className="flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center rounded-xl bg-[#5A2D82] px-3 py-2 shadow-sm">
          <img
            src="/logo333.png"
            alt="PLANdeC"
            className="h-10 w-auto object-contain"
          />
        </Link>

        <nav ref={navRef} className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => {
            if (!link.children) {
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-[#4F4658] transition hover:text-[#5A2D82]"
                >
                  {link.label}
                </Link>
              );
            }

            const isOpen = openDropdown === link.label;

            return (
              <div key={link.label} className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setOpenDropdown(isOpen ? null : link.label)
                  }
                  className="flex items-center gap-2 text-sm font-medium text-[#4F4658] transition hover:text-[#5A2D82]"
                  aria-expanded={isOpen}
                >
                  {link.label}

                  <span
                    className={`text-[10px] text-[#7B3FB6] transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  >
                    ▼
                  </span>
                </button>

                {isOpen && (
                  <div className="absolute left-0 top-full mt-3 min-w-[240px] overflow-hidden rounded-2xl border border-[#E8E0EC] bg-white shadow-xl shadow-[#5A2D82]/10">
                    <div className="p-2">
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setOpenDropdown(null)}
                          className="block rounded-xl px-4 py-3 text-sm text-[#5F5868] transition hover:bg-[#F5EFF8] hover:text-[#5A2D82]"
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
          className="rounded-full bg-[#5A2D82] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#5A2D82]/20 transition hover:-translate-y-0.5 hover:bg-[#7138A3]"
        >
          Ingresar
        </Link>
      </Container>
    </header>
  );
}
