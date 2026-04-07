export type NewsItem = {
  id: string;
  title: string;
  excerpt: string;
};

export async function getNews(): Promise<NewsItem[]> {
  // 🔥 aquí luego conectamos Notion
  return [
    {
      id: "1",
      title: "Elecciones en América Latina marcan nueva tendencia política",
      excerpt: "Un análisis comparado muestra cambios en la intención de voto y comportamiento electoral.",
    },
    {
      id: "2",
      title: "Reconfiguración de partidos en Europa",
      excerpt: "Nuevas alianzas estratégicas redefinen el panorama político regional.",
    },
    {
      id: "3",
      title: "Impacto de redes sociales en campañas políticas",
      excerpt: "El uso de datos y segmentación redefine la comunicación política.",
    },
  ];
}