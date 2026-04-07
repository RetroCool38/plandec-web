"use client";

import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import Container from "@/components/ui/container";

const countries = [
  {
    id: "colombia",
    name: "Colombia",
    href: "/pais/colombia",
    x: 300,
    y: 255,
    width: 34,
    height: 54,
    color: "#F4C542",
  },
  {
    id: "brasil",
    name: "Brasil",
    href: "#",
    x: 340,
    y: 280,
    width: 90,
    height: 95,
    color: "#2E8B57",
  },
  {
    id: "mexico",
    name: "México",
    href: "#",
    x: 180,
    y: 170,
    width: 70,
    height: 40,
    color: "#3CB371",
  },
  {
    id: "argentina",
    name: "Argentina",
    href: "#",
    x: 350,
    y: 390,
    width: 38,
    height: 95,
    color: "#6CB4EE",
  },
  {
    id: "espana",
    name: "España",
    href: "#",
    x: 560,
    y: 170,
    width: 36,
    height: 24,
    color: "#C95A49",
  },
  {
    id: "francia",
    name: "Francia",
    href: "#",
    x: 600,
    y: 160,
    width: 30,
    height: 28,
    color: "#4F7CAC",
  },
  {
    id: "alemania",
    name: "Alemania",
    href: "#",
    x: 630,
    y: 150,
    width: 26,
    height: 36,
    color: "#777777",
  },
];

export default function WorldMap() {
  const router = useRouter();

  return (
    <section className="py-20">
      <Container>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold">Análisis político global</h2>
          <p className="mt-3 max-w-2xl text-white/65">
            Explora el mapa y entra a la ficha política de cada país disponible.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0B1020] p-4 shadow-[0_0_40px_rgba(0,0,0,0.25)]">
          <div className="relative mx-auto aspect-[16/9] w-full max-w-6xl overflow-hidden rounded-xl bg-[radial-gradient(circle_at_center,_rgba(90,45,130,0.18),_transparent_45%),linear-gradient(180deg,_#0E152B_0%,_#09101F_100%)]">
            <svg
              viewBox="0 0 1000 560"
              className="h-full w-full"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="6" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <ellipse cx="500" cy="280" rx="420" ry="180" fill="rgba(90,45,130,0.08)" />

              <path
                d="M120 150 C170 120, 260 120, 330 170 C360 190, 380 220, 390 260 C400 300, 390 340, 360 370 C320 410, 250 430, 210 410 C170 390, 130 340, 120 300 C110 250, 95 190, 120 150 Z"
                fill="#18243D"
                stroke="rgba(255,255,255,0.08)"
              />

              <path
                d="M500 140 C570 120, 680 120, 760 150 C840 180, 900 230, 910 280 C920 340, 880 390, 810 410 C730 430, 620 420, 560 390 C510 365, 490 320, 485 270 C480 220, 455 160, 500 140 Z"
                fill="#18243D"
                stroke="rgba(255,255,255,0.08)"
              />

              <path
                d="M760 390 C790 380, 860 390, 900 420 C930 445, 930 480, 900 500 C860 525, 790 520, 760 495 C735 470, 730 420, 760 390 Z"
                fill="#18243D"
                stroke="rgba(255,255,255,0.08)"
              />

              {countries.map((country) => {
                const clickable = country.href !== "#";

                return (
                  <foreignObject
                    key={country.id}
                    x={country.x}
                    y={country.y}
                    width={country.width}
                    height={country.height}
                    style={{ overflow: "visible" }}
                  >
                    <motion.button
                      whileHover={{
                        scale: 1.18,
                        y: -3,
                      }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 260, damping: 18 }}
                      onClick={() => {
                        if (clickable) router.push(country.href);
                      }}
                      className={`group relative flex h-full w-full items-center justify-center rounded-md border text-[10px] font-semibold text-white shadow-lg ${
                        clickable ? "cursor-pointer" : "cursor-default"
                      }`}
                      style={{
                        backgroundColor: country.color,
                        borderColor: "rgba(255,255,255,0.25)",
                        filter: clickable ? "url(#glow)" : "none",
                      }}
                      title={country.name}
                    >
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-[#050816] px-3 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
                        {country.name}
                      </span>
                    </motion.button>
                  </foreignObject>
                );
              })}
            </svg>
          </div>

          <div className="mt-4 flex flex-wrap gap-3 text-sm text-white/65">
            <span className="rounded-full border border-white/10 px-3 py-1">
              Colombia activa
            </span>
            <span className="rounded-full border border-white/10 px-3 py-1">
              Próximamente más países
            </span>
            <span className="rounded-full border border-white/10 px-3 py-1">
              Clic en el país para abrir su ficha
            </span>
          </div>
        </div>
      </Container>
    </section>
  );
}