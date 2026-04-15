import Container from "@/components/ui/container";

export default function SolucionesPage() {
  return (
    <Container className="py-16">
      {/* HERO */}
      <div className="max-w-4xl">
        <p className="text-sm uppercase tracking-[0.2em] text-[#A970FF]">
          Soluciones
        </p>

        <h1 className="mt-4 text-4xl font-bold text-white">
          Soluciones estratégicas para campañas y posicionamiento político
        </h1>

        <p className="mt-6 text-lg leading-8 text-white/70">
          Diseñamos, analizamos y ejecutamos estrategias basadas en datos,
          territorio y comunicación efectiva para campañas, organizaciones e
          instituciones.
        </p>
      </div>

      {/* SERVICIOS */}
      <section className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {[
          "Estrategia de campaña",
          "Gestión de campaña",
          "Relaciones públicas",
          "Análisis de datos",
          "Storytelling político",
          "Imagen pública",
          "Manejo de crisis",
        ].map((service) => (
          <div
            key={service}
            className="rounded-2xl border border-white/10 bg-[#0B1020] p-6 transition hover:border-[#5A2D82]"
          >
            <h3 className="text-xl font-semibold text-white">{service}</h3>

            <p className="mt-4 text-sm text-white/60">
              Solución estratégica enfocada en resultados, posicionamiento y
              toma de decisiones políticas.
            </p>
          </div>
        ))}
      </section>

      {/* PROCESO */}
      <section className="mt-20">
        <h2 className="text-3xl font-bold text-white">Cómo trabajamos</h2>

        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {["Análisis", "Estrategia", "Ejecución", "Optimización"].map(
            (step) => (
              <div
                key={step}
                className="rounded-2xl border border-white/10 bg-[#0B1020] p-6"
              >
                <h3 className="text-lg font-semibold text-white">{step}</h3>

                <p className="mt-3 text-sm text-white/60">
                  Proceso estructurado para lograr resultados reales.
                </p>
              </div>
            )
          )}
        </div>
      </section>

      {/* CTA + FORMULARIO */}
      <section className="mt-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-white">
            ¿Quieres llevar tu proyecto político al siguiente nivel?
          </h2>

          <p className="mt-4 text-white/70">
            Déjanos tus datos y te contactaremos directamente para evaluar tu
            caso.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-2xl">
          <form
            action="https://formspree.io/f/YOUR_ID"
            method="POST"
            className="space-y-6"
          >
            <input
              type="text"
              name="nombre"
              placeholder="Nombre completo"
              required
              className="w-full rounded-xl border border-white/10 bg-[#0B1020] px-4 py-3 text-white placeholder:text-white/40"
            />

            <input
              type="tel"
              name="telefono"
              placeholder="Número de teléfono"
              required
              className="w-full rounded-xl border border-white/10 bg-[#0B1020] px-4 py-3 text-white placeholder:text-white/40"
            />

            <input
              type="email"
              name="email"
              placeholder="Correo electrónico"
              required
              className="w-full rounded-xl border border-white/10 bg-[#0B1020] px-4 py-3 text-white placeholder:text-white/40"
            />

            <textarea
              name="mensaje"
              placeholder="¿Qué necesitas? Cuéntanos tu caso..."
              rows={4}
              required
              className="w-full rounded-xl border border-white/10 bg-[#0B1020] px-4 py-3 text-white placeholder:text-white/40"
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
      </section>
    </Container>
  );
}