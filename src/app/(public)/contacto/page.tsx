import Container from "@/components/ui/container";

export default function ContactoPage() {
  return (
    <Container className="py-16">
      <div className="max-w-3xl">
        <p className="text-sm uppercase tracking-[0.2em] text-[#5A2D82]">
          Contacto
        </p>

        <h1 className="mt-4 text-4xl font-bold text-[#251B38]">
          Hablemos sobre estrategia, posicionamiento y asesoría política
        </h1>

        <p className="mt-6 text-lg leading-8 text-[#625A69]">
          PLANdeC está diseñado para acompañar campañas, organizaciones y
          procesos de comunicación política con una visión estratégica,
          territorial y orientada a resultados.
        </p>
      </div>

      <div className="mt-12 grid items-start gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-[#D9C7E8] bg-white/85 p-8 shadow-xl shadow-[#5A2D82]/8">
          <h2 className="text-2xl font-semibold text-[#251B38]">
            Solicitar asesoría
          </h2>

          <p className="mt-4 text-[#625A69]">
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
              className="w-full rounded-xl border border-[#D8CBE0] bg-white px-4 py-3 text-[#2A2140] placeholder:text-[#8B8290] focus:border-[#5A2D82] focus:outline-none"
            />

            <input
              type="tel"
              name="telefono"
              placeholder="Número de teléfono"
              required
              className="w-full rounded-xl border border-[#D8CBE0] bg-white px-4 py-3 text-[#2A2140] placeholder:text-[#8B8290] focus:border-[#5A2D82] focus:outline-none"
            />

            <input
              type="email"
              name="email"
              placeholder="Correo electrónico"
              required
              className="w-full rounded-xl border border-[#D8CBE0] bg-white px-4 py-3 text-[#2A2140] placeholder:text-[#8B8290] focus:border-[#5A2D82] focus:outline-none"
            />

            <textarea
              name="mensaje"
              placeholder="¿Qué necesitas? Cuéntanos tu caso..."
              rows={4}
              required
              className="w-full rounded-xl border border-[#D8CBE0] bg-white px-4 py-3 text-[#2A2140] placeholder:text-[#8B8290] focus:border-[#5A2D82] focus:outline-none"
            />

            <button
              type="submit"
              className="w-full rounded-full bg-[#5A2D82] py-3 font-semibold text-white transition hover:opacity-90"
            >
              Enviar solicitud
            </button>
          </form>

          <a
            href="https://wa.me/573160450461?text=Hola,%20quiero%20información%20sobre%20asesoría%20política"
            target="_blank"
            rel="noreferrer"
            className="mt-6 block rounded-full border border-[#5A2D82] py-3 text-center font-semibold text-[#5A2D82] transition hover:bg-[#F3EAF8]"
          >
            Asesoría inmediata por WhatsApp
          </a>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-[#D9C7E8] bg-white/85 p-8 shadow-xl shadow-[#5A2D82]/8">
            <h2 className="text-xl font-semibold text-[#251B38]">
              Canales de contacto
            </h2>

            <div className="mt-6 space-y-5 text-[#625A69]">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-[#7B3FB6]">
                  Correo
                </p>
                <a
                  href="mailto:meulenbeekw@gmail.com"
                  className="mt-2 inline-block text-lg font-semibold text-[#342A40] transition hover:text-[#5A2D82]"
                >
                  meulenbeekw@gmail.com
                </a>
              </div>

              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-[#7B3FB6]">
                  Teléfono / WhatsApp
                </p>
                <a
                  href="https://wa.me/573160450461"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-lg font-semibold text-[#342A40] transition hover:text-[#5A2D82]"
                >
                  +57 316 045 0461
                </a>
              </div>

              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-[#7B3FB6]">
                  Instagram
                </p>
                <a
                  href="https://www.instagram.com/plan_de_c/"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-lg font-semibold text-[#342A40] transition hover:text-[#5A2D82]"
                >
                  @plan_de_c
                </a>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#D9C7E8] bg-white/85 p-8 shadow-xl shadow-[#5A2D82]/8">
            <h2 className="text-xl font-semibold text-[#251B38]">Instagram</h2>

            <p className="mt-3 text-sm leading-6 text-[#625A69]">
              Escanea o haz clic para ver el perfil y seguir la evolución de
              PLANdeC.
            </p>

            <a
              href="https://www.instagram.com/plan_de_c/"
              target="_blank"
              rel="noreferrer"
              className="mt-6 block overflow-hidden rounded-2xl border border-[#D9C7E8]"
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
