import { notFound } from "next/navigation";
import Container from "@/components/ui/container";

type Party = {
  name: string;
  percentage: number;
  color: string;
};

type Country = {
  name: string;
  flag: string;
  system: string;
  president: string;
  parties: Party[];
};

const countries: Record<string, Country> = {
  colombia: {
    name: "Colombia",
    flag: "🇨🇴",
    system: "República presidencialista",
    president: "Gustavo Petro",
    parties: [
      { name: "Pacto Histórico", percentage: 28, color: "#D32F2F" },
      { name: "Centro Democrático", percentage: 21, color: "#1976D2" },
      { name: "Partido Liberal", percentage: 14, color: "#C62828" },
      { name: "Cambio Radical", percentage: 8, color: "#F9A825" },
    ],
  },
  panama: {
    name: "Panamá",
    flag: "🇵🇦",
    system: "República presidencialista",
    president: "José Raúl Mulino",
    parties: [
      { name: "Realizando Metas", percentage: 32, color: "#1565C0" },
      { name: "PRD", percentage: 24, color: "#2E7D32" },
      { name: "Partido Panameñista", percentage: 18, color: "#F9A825" },
      { name: "Movimiento Otro Camino", percentage: 11, color: "#8E24AA" },
    ],
  },
  "paises-bajos": {
    name: "Países Bajos",
    flag: "🇳🇱",
    system: "Monarquía parlamentaria",
    president: "Dick Schoof",
    parties: [
      { name: "PVV", percentage: 23, color: "#1E88E5" },
      { name: "VVD", percentage: 20, color: "#FF9800" },
      { name: "GroenLinks-PvdA", percentage: 17, color: "#2E7D32" },
      { name: "NSC", percentage: 12, color: "#0097A7" },
    ],
  },
};

type CountryPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return [
    { slug: "colombia" },
    { slug: "panama" },
    { slug: "paises-bajos" },
  ];
}

export default async function CountryPage({ params }: CountryPageProps) {
  const { slug } = await params;
  const country = countries[slug];

  if (!country) {
    notFound();
  }

  return (
    <Container className="py-16">
      <div className="flex items-center gap-4">
        <span className="text-4xl">{country.flag}</span>
        <div>
          <h1 className="text-3xl font-bold">{country.name}</h1>
          <p className="text-white/60">{country.system}</p>
        </div>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-white/10 p-6">
          <h3 className="text-sm text-white/60">Presidente</h3>
          <p className="mt-2 text-lg font-semibold">{country.president}</p>
        </div>

        <div className="rounded-xl border border-white/10 p-6 md:col-span-2">
          <h3 className="text-sm text-white/60">Partidos políticos</h3>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {country.parties.map((party) => (
              <div
                key={party.name}
                className="rounded-xl border border-white/10 p-5 transition hover:scale-[1.02]"
              >
                <div className="flex items-center justify-between gap-4">
                  <h4 className="font-semibold">{party.name}</h4>
                  <span
                    className="text-sm font-bold"
                    style={{ color: party.color }}
                  >
                    {party.percentage}%
                  </span>
                </div>

                <div className="mt-3 h-2 w-full rounded-full bg-white/10">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${party.percentage}%`,
                      backgroundColor: party.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Container>
  );
}