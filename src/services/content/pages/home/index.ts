import type { HomeContent } from "../types/content.types";

export const homeContent: HomeContent = {
  hero: {
    tag: "Inteligencia política",

    title:
      "Anticipa escenarios políticos y posiciona tu liderazgo con estrategia",

    subtitle:
      "Análisis electoral, comportamiento del votante y estrategias de posicionamiento para campañas, gobiernos y organizaciones que buscan influir y liderar.",

    authority:
      "Plataforma de análisis político basada en datos, territorio y tendencias reales.",

    image: "/hero.png",

    primaryButton: {
      label: "Explorar plataforma",
      href: "/pais/colombia",
    },

    secondaryButton: {
      label: "Ver soluciones",
      href: "/soluciones",
    },
  },
  
  globalAnalysis: {
  eyebrow: "Presencia internacional",
  title: "Análisis político global",
  description:
    "Explora los países donde PLANdeC desarrolla análisis político, comunicación estratégica e inteligencia electoral.",
},

news: {
  eyebrow: "Actualidad política",
  title: "Noticias y análisis",
  description:
    "Contenido político, electoral e institucional de los países donde PLANdeC tiene presencia.",
},
};