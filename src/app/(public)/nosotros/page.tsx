import Link from "next/link";
import Container from "@/components/ui/container";
import { teamMock } from "@/services/mock/team";

export default function NosotrosPage() {
  return (
    <Container className="py-16">
      <div className="max-w-4xl">
        <p className="text-sm uppercase tracking-[0.2em] text-[#A970FF]">
          Nosotros
        </p>

        <h1 className="mt-4 text-4xl font-bold text-white">
          Estrategia política, comunicación y tecnología con visión de futuro
        </h1>

        <p className="mt-6 text-lg leading-8 text-white/70">
          PLANdeC es una firma orientada al análisis político, la estrategia de
          posicionamiento y la construcción de comunicación pública con visión
          territorial, electoral e institucional. Integramos estrategia,
          comunicación, diseño y tecnología para acompañar campañas,
          organizaciones y proyectos políticos de forma estructurada y efectiva.
        </p>
      </div>

      <section className="mt-16 grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-[#0B1020] p-8">
          <h2 className="text-2xl font-semibold text-white">Visión</h2>
          <p className="mt-4 leading-7 text-white/70">
            Nuestra visión es ayudarte a alcanzar tus objetivos y consolidarte
            como un referente dentro de tu sector. Al mismo tiempo, buscamos
            consolidar a PLANdeC como una de las firmas jóvenes de referencia en
            el ámbito de la comunicación y el marketing político, tanto a nivel
            local como iberoamericano.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0B1020] p-8">
          <h2 className="text-2xl font-semibold text-white">
            Enfoque estratégico
          </h2>
          <p className="mt-4 leading-7 text-white/70">
            Nos enfocamos en el desarrollo de campañas permanentes con el fin de
            ingresar en la mente del elector y posicionarte como una opción real
            dentro del abanico de candidatos existente. Trabajamos para ayudarte
            a convertirte en la alternativa más adecuada para tus electores.
          </p>
          <p className="mt-4 leading-7 text-white/70">
            En el ámbito institucional, buscamos posicionar a tu organización en
            la percepción y recordación de la comunidad, con el fin de mejorar
            la imagen que se tiene de ella y fortalecer su legitimidad pública.
          </p>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-3xl font-bold text-white">Nuestros pilares</h2>

        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              title: "Estrategia",
              text: "Diseñamos rutas claras de posicionamiento político e institucional con enfoque en resultados.",
            },
            {
              title: "Comunicación",
              text: "Construimos narrativas, mensajes y líneas de comunicación coherentes con cada contexto.",
            },
            {
              title: "Territorio",
              text: "Entendemos la importancia del entorno, la comunidad y la dinámica local en la toma de decisiones.",
            },
            {
              title: "Tecnología y análisis",
              text: "Integramos herramientas digitales, visualización y estructura de información para fortalecer campañas y procesos políticos.",
            },
          ].map((pillar) => (
            <div
              key={pillar.title}
              className="rounded-2xl border border-white/10 bg-[#0B1020] p-6"
            >
              <h3 className="text-xl font-semibold text-white">
                {pillar.title}
              </h3>
              <p className="mt-4 text-sm leading-7 text-white/70">
                {pillar.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-white">Nuestro equipo</h2>
          <p className="mt-4 text-white/70">
            PLANdeC reúne perfiles en estrategia, comunicación, diseño y
            tecnología que trabajan de forma coordinada para desarrollar
            campañas y proyectos políticos con visión estratégica.
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {teamMock.map((member) => (
            <Link
              key={member.slug}
              href={`/nosotros/equipo/${member.slug}`}
              className="rounded-2xl border border-white/10 bg-[#0B1020] p-8 transition hover:scale-[1.01] hover:border-white/20"
            >
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                <img
                  src={member.image}
                  alt={member.name}
                  className="h-28 w-28 rounded-full border-2 border-[#5A2D82] object-cover"
                />

                <div>
                  <h3 className="text-2xl font-bold text-white">
                    {member.name}
                  </h3>
                  <p className="mt-1 font-medium text-[#A970FF]">
                    {member.role}
                  </p>
                  <p className="mt-4 text-sm leading-7 text-white/70">
                    {member.shortDescription}
                  </p>
                  <p className="mt-4 text-sm font-medium text-white/60">
                    Ver perfil completo →
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </Container>
  );
}