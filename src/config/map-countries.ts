export type MapCountry = {
  geographyName: string;
  name: string;
  slug: string;
  href: string;
  color: string;
  coordinates: [number, number];
  labelOffset: number;
  labelOffsetX: number;
  labelAnchor: "start" | "middle" | "end";
  description: string;
};

export const activeMapCountries: MapCountry[] = [
  {
    geographyName: "Colombia",
    name: "Colombia",
    slug: "colombia",
    href: "/pais/colombia",
    color: "#F4C542",
    coordinates: [-74.3, 4.5],
    labelOffset: 27,
    labelOffsetX: 14,
    labelAnchor: "start",
    description: "Inteligencia electoral y análisis territorial",
  },
  {
    geographyName: "Panama",
    name: "Panamá",
    slug: "panama",
    href: "/pais/panama",
    color: "#E53935",
    coordinates: [-80.1, 8.6],
    labelOffset: -13,
    labelOffsetX: -14,
    labelAnchor: "end",
    description: "Gobernabilidad, economía y comunicación pública",
  },
  {
    geographyName: "Netherlands",
    name: "Países Bajos",
    slug: "paises-bajos",
    href: "/pais/paises-bajos",
    color: "#FF6F00",
    coordinates: [5.4, 52.2],
    labelOffset: 17,
    labelOffsetX: 0,
    labelAnchor: "middle",
    description: "Política europea y dinámica parlamentaria",
  },
];

export const activeMapCountriesByName = new Map(
  activeMapCountries.map((country) => [country.geographyName, country])
);
