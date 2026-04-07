import Container from "@/components/ui/container";

type Params = {
  params: {
    slug: string;
  };
};

export default function CountryPage({ params }: Params) {
  const { slug } = params;

  // 🔥 luego esto vendrá de base de datos / Notion
  const country = {
    name: "Colombia",
    flag: "🇨🇴",
    system: "República presidencialista",
    president: "Gustavo Petro",
    parties: [
  {
    name: "Pacto Histórico",
    percentage: 28,
    color: "#D32F2F",
  },
  {
    name: "Centro Democrático",
    percentage: 21,
    color: "#1976D2",
  },
  {
    name: "Partido Liberal",
    percentage: 14,
    color: "#C62828",
  },
  {
    name: "Cambio Radical",
    percentage: 8,
    color: "#F9A825",
  },
],
  };

  const isClient = false; // 🔥 luego vendrá del login

  return (
    <Container className="py-16">
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <span className="text-4xl">{country.flag}</span>
        <div>
          <h1 className="text-3xl font-bold">{country.name}</h1>
          <p className="text-white/60">{country.system}</p>
        </div>
      </div>

      {/* INFO BÁSICA */}
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
      <div className="flex items-center justify-between">
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

      {/* ZONA CLIENTE */}
      {isClient && (
        <div className="mt-16 space-y-10">
          <div className="rounded-xl border border-[#5A2D82] p-6">
            <h2 className="text-xl font-semibold">Descripción estratégica</h2>
            <p className="mt-3 text-white/70">
              Colombia presenta un escenario político fragmentado con alta
              polarización y tendencias de cambio en el comportamiento electoral.
            </p>
          </div>

          <div className="rounded-xl border border-[#5A2D82] p-6">
            <h2 className="text-xl font-semibold">Resultados electorales</h2>
            <p className="mt-3 text-white/70">
              Aquí se visualizarán resultados y tendencias (futuro gráfico).
            </p>
          </div>

          <div className="rounded-xl border border-[#5A2D82] p-6">
            <h2 className="text-xl font-semibold">Análisis político</h2>
            <p className="mt-3 text-white/70">
              Interpretación estratégica del contexto político.
            </p>
          </div>
        </div>
      )}
    </Container>
  );
}