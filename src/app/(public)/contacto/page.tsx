import Container from "@/components/ui/container";

export default function ContactoPage() {
  return (
    <Container className="py-16">
      <div className="max-w-3xl">
        <p className="text-sm uppercase tracking-[0.2em] text-[#5A2D82]">
          Contacto
        </p>

        <h1 className="mt-4 text-4xl font-bold text-white">
          Hablemos sobre estrategia, posicionamiento y asesoría política
        </h1>

        <p className="mt-6 text-lg leading-8 text-white/70">
          PLANdeC está diseñado para acompañar campañas, organizaciones y
          procesos de comunicación política con una visión estratégica,
          territorial y orientada a resultados.
        </p>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-white/10 bg-[#0B1020] p-8">
          <h2 className="text-2xl font-semibold text-white">
            Solicitar asesoría
          </h2>

          <p className="mt-4 text-white/70">
            Déjanos tus datos y te contactaremos para construir una estrategia
            adaptada a tu contexto político o institucional.
          </p>

          <form
            action="https://formspree.io/f/YOUR_ID"
            method="POST"
            className="mt-8 space-y-4"
          >
            <input
              type="text"
              name="nombre"
              placeholder="Nombre completo"
              required
              className="w-full rounded-xl border border-white/10 bg-[#08101F] px-4 py-3 text-white placeholder:text-white/40 focus:border-[#5A2D82] focus:outline-none"
            />

            <input
              type="tel"
              name="telefono"
              placeholder="Número de teléfono"
              required
              className="w-full rounded-xl border border-white/10 bg-[#08101F] px-4 py-3 text-white placeholder:text-white/40 focus:border-[#5A2D82] focus:outline-none"
            />

            <input
              type="email"
              name="email"
              placeholder="Correo electrónico"
              required
              className="w-full rounded-xl border border-white/10 bg-[#08101F] px-4 py-3 text-white placeholder:text-white/40 focus:border-[#5A2D82] focus:outline-none"
            />

            <textarea
              name="mensaje"
              placeholder="¿Qué necesitas? Cuéntanos tu caso..."
              rows={4}
              required
              className="w-full rounded-xl border border-white/10 bg-[#08101F] px-4 py-3 text-white placeholder:text-white/40 focus:border-[#5A2D82] focus:outline-none"
            />

            <button
              type="submit"
              className="w-full rounded-full bg-[#5A2D82] py-3 font-semibold text-white transition hover:opacity-90"
            >
              Enviar solicitud
            </button>
          </form>

          <a
            href="https://wa.me/31642740647?text=Hola,%20quiero%20información%20sobre%20asesoría%20política"
            target="_blank"
            rel="noreferrer"
            className="mt-6 block rounded-full border border-white/20 py-3 text-center text-white transition hover:bg-white/10"
          >
            Asesoría inmediata por WhatsApp
          </a>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-[#0B1020] p-8">
            <h2 className="text-xl font-semibold text-white">
              Canales de contacto
            </h2>

            <div className="mt-6 space-y-5 text-white/75">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-white/40">
                  Correo
                </p>
                <a
                  href="mailto:meulenbeekw@gmail.com"
                  className="mt-2 inline-block text-lg text-white transition hover:text-[#A970FF]"
                >
                  meulenbeekw@gmail.com
                </a>
              </div>

              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-white/40">
                  Teléfono / WhatsApp
                </p>
                <a
                  href="https://wa.me/31642740647"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-lg text-white transition hover:text-[#A970FF]"
                >
                  +31 642740647
                </a>
              </div>

              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-white/40">
                  Instagram
                </p>
                <a
                  href="https://www.instagram.com/plan_de_c/"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-lg text-white transition hover:text-[#A970FF]"
                >
                  @plan_de_c
                </a>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0B1020] p-8">
            <h2 className="text-xl font-semibold text-white">Instagram</h2>

            <p className="mt-3 text-sm leading-6 text-white/65">
              Escanea o haz clic para ver el perfil y seguir la evolución de
              PLANdeC.
            </p>

            <a
              href="https://www.instagram.com/plan_de_c/"
              target="_blank"
              rel="noreferrer"
              className="mt-6 block overflow-hidden rounded-2xl border border-white/10"
            >
              <img
                src="/instagram-qr.png"
                alt="Instagram PLANdeC"
                className="w-full object-cover"
              />
            </a>
          </div>
        </div>
      </div>
    </Container>
  );
}