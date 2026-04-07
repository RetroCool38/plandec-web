import Link from "next/link";
import Container from "@/components/ui/container";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#070B14] text-white">
      <Container className="py-12">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <h3 className="text-lg font-semibold">PLANdeC</h3>
            <p className="mt-3 max-w-sm text-sm leading-6 text-white/70">
              Plataforma de inteligencia política enfocada en análisis estratégico,
              información comparada, noticias y toma de decisiones.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-white/60">
              Navegación
            </h4>
            <div className="mt-4 flex flex-col gap-3 text-sm text-white/75">
              <Link href="/nosotros" className="hover:text-white">
                Nosotros
              </Link>
              <Link href="/soluciones" className="hover:text-white">
                Soluciones
              </Link>
              <Link href="/noticias" className="hover:text-white">
                Noticias
              </Link>
              <Link href="/contacto" className="hover:text-white">
                Contacto
              </Link>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-white/60">
              Contacto
            </h4>
            <div className="mt-4 space-y-3 text-sm text-white/75">
              <p>Colombia · Operación regional</p>
              <p>contacto@plandec.com</p>
              <p>Análisis, estrategia y posicionamiento político</p>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-xs text-white/50">
          © {new Date().getFullYear()} PLANdeC. Todos los derechos reservados.
        </div>
      </Container>
    </footer>
  );
}