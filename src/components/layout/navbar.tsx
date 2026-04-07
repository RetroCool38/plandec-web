import Link from "next/link";
import Container from "@/components/ui/container";

const navLinks = [
  { label: "Inicio", href: "/" },
  { label: "Nosotros", href: "/nosotros" },
  { label: "Soluciones", href: "/soluciones" },
  { label: "Noticias", href: "/noticias" },
  { label: "País", href: "/pais" },
  { label: "Contacto", href: "/contacto" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0B1020]/90 backdrop-blur-md">
      <Container className="flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
  <img
    src="/logo.png"
    alt="PLANdeC"
   className="h-18 w-auto"
  />
</Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-white/80 transition hover:text-white"
            >
              {link.label}
            </Link>
          ))}
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