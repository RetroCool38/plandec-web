import Link from "next/link";
import Container from "@/components/ui/container";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-white/10 bg-[#08101F]">
      <Container className="py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <h3 className="text-2xl font-bold text-white">PLANdeC</h3>
            <p className="mt-4 text-sm leading-7 text-white/70">
              Plataforma de inteligencia política enfocada en análisis
              estratégico, información comparada y posicionamiento.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white/50">
              Navegación
            </h3>

            <div className="mt-4 space-y-3 text-sm text-white/70">
              <Link href="/nosotros" className="block hover:text-white">
                Nosotros
              </Link>
              <Link href="/soluciones" className="block hover:text-white">
                Soluciones
              </Link>
              <Link href="/noticias" className="block hover:text-white">
                Noticias
              </Link>
              <Link href="/contacto" className="block hover:text-white">
                Contacto
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white/50">
              Contacto
            </h3>

            <div className="mt-4 space-y-4 text-sm text-white/70">
              <div>
                <p className="text-white">WhatsApp</p>
                <a
                  href="https://wa.me/31642740647"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#A970FF] hover:underline"
                >
                  +31 642740647
                </a>
              </div>

              <div>
                <p className="text-white">Correo</p>
                <a
                  href="mailto:meulenbeekw@gmail.com"
                  className="text-[#A970FF] hover:underline"
                >
                  meulenbeekw@gmail.com
                </a>
              </div>

              <div>
                <p className="text-white">Instagram</p>
                <a
                  href="https://www.instagram.com/plan_de_c/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#A970FF] hover:underline"
                >
                  @plan_de_c
                </a>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white/50">
              Instagram
            </h3>

            <p className="mt-4 text-sm leading-6 text-white/65">
              Escanea el código para seguir el contenido y la evolución de
              PLANdeC.
            </p>

            <a
              href="https://www.instagram.com/plan_de_c/"
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-block"
            >
              <img
                src="/instagram-qr.png"
                alt="Instagram PLANdeC"
                className="w-24 rounded-xl border border-white/10 transition hover:scale-105"
              />
            </a>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-sm text-white/50">
          © {new Date().getFullYear()} PLANdeC. Todos los derechos reservados.
        </div>
      </Container>
    </footer>
  );
}