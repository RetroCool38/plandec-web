import Image from "next/image";
import Link from "next/link";

import { homeContent } from "@/services/content/pages/home";

export default function Hero() {
  const hero = homeContent.hero;

  return (
   <section className="relative overflow-hidden bg-gradient-to-br from-[#E9D9F4] via-[#F4ECF9] to-[#DCC2EE]">
    {/* Fondo morado difuminado */}
<div className="pointer-events-none absolute inset-0 overflow-hidden">
  <div className="absolute -left-40 -top-40 h-[620px] w-[620px] rounded-full bg-[#7B3FB6]/35 blur-[140px]" />
  <div className="absolute right-[-180px] top-10 h-[560px] w-[560px] rounded-full bg-[#A970FF]/30 blur-[130px]" />
  <div className="absolute bottom-[-260px] left-1/3 h-[620px] w-[620px] rounded-full bg-[#5A2D82]/25 blur-[160px]" />
</div>
      <div className="relative mx-auto grid min-h-[calc(100vh-76px)] max-w-7xl items-center gap-6 px-6 py-16 lg:grid-cols-2 lg:px-10 lg:py-20">
        {/* CONTENIDO */}
        <div className="z-10 max-w-2xl">
          {/* Tag superior */}
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.22em] text-[#7B3FB6]">
            {hero.tag}
          </p>

          {/* Título */}
          <h1 className="text-4xl font-bold leading-[1.08] text-[#2A2140] sm:text-5xl lg:text-6xl">
            {hero.title}
          </h1>

          {/* Subtítulo */}
          <p className="mt-6 max-w-xl text-lg leading-8 text-[#5F5868]">
            {hero.subtitle}
          </p>

          {/* Línea de autoridad */}
          <p className="mt-4 max-w-xl text-sm leading-6 text-[#7A7282]">
            {hero.authority}
          </p>

          {/* Botones */}
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/soluciones"
              className="inline-flex items-center justify-center rounded-full bg-[#5A2D82] px-7 py-3.5 font-semibold text-white shadow-lg shadow-[#5A2D82]/20 transition hover:bg-[#7138A3] hover:-translate-y-0.5"
            >
              Explorar plataforma
            </Link>

            <Link
              href="/soluciones"
              className="inline-flex items-center justify-center rounded-full border border-[#5A2D82] bg-white px-7 py-3.5 font-semibold text-[#5A2D82] transition hover:bg-[#F5EFF8] hover:-translate-y-0.5"
            >
              Ver soluciones
            </Link>
          </div>

          {/* Línea institucional */}
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-[#E8E0EC] pt-6 text-sm text-[#6D6575]">
            <span>Análisis político</span>
            <span className="hidden h-1 w-1 rounded-full bg-[#A970C8] sm:block" />
            <span>Inteligencia electoral</span>
            <span className="hidden h-1 w-1 rounded-full bg-[#A970C8] sm:block" />
            <span>Estrategia internacional</span>
          </div>
        </div>

        {/* IMAGEN */}
        <div className="relative">
          
          <div className="relative min-h-[420px] overflow-hidden rounded-[2rem] shadow-2xl shadow-[#5A2D82]/15 sm:min-h-[520px]">
            <Image
              src={hero.image || "/hero.png"}
              alt="Estrategia e inteligencia política PLANdeC"
              fill
              priority
              className="object-cover object-center"
            />

            {/* Degradado claro, no negro */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/35 via-transparent to-transparent" />

            {/* Tarjeta flotante */}
            <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/20 bg-[#5A2D82]/90 p-5 shadow-lg backdrop-blur-md sm:right-auto sm:max-w-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#E8DDF3]">
                PLANdeC
              </p>

              <p className="mt-2 text-lg font-semibold leading-snug text-white">
                Decisiones estratégicas respaldadas por análisis, datos y
                conocimiento territorial.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}