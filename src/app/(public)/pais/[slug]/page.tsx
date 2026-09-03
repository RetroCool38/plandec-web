import { notFound } from "next/navigation";
import Container from "@/components/ui/container";
import { countriesMock } from "@/services/mock/countries";

type CountryPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return countriesMock.map((country) => ({
    slug: country.slug,
  }));
}

export default async function CountryPage({ params }: CountryPageProps) {
  const { slug } = await params;

  const country = countriesMock.find((c) => c.slug === slug);

  if (!country) {
    notFound();
  }

  const politicalInfo = [
    {
      label: country.headOfStateTitle || "Presidente",
      value: country.headOfState || country.president,
    },
    {
      label: country.headOfGovernmentTitle,
      value: country.headOfGovernment,
    },
    {
      label: "Capital",
      value: country.capital,
    },
    {
      label: "Última elección",
      value: country.election,
    },
    {
      label: "Participación",
      value: country.turnout,
    },
  ].filter((item) => item.value);

  return (
    <Container className="py-16">
      <div className="flex items-center gap-4 rounded-2xl border border-[#D9C7E8] bg-white/75 p-6 shadow-lg shadow-[#5A2D82]/5">
        <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#5A2D82] to-[#8B55B2] text-lg font-bold tracking-[.08em] text-white shadow-md" aria-hidden="true">{country.flag}</span>
        <div>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[#7B3FB6]">Perfil político</p>
          <h1 className="mt-1 text-3xl font-bold text-[#251B38]">{country.name}</h1>
          <p className="mt-1 text-[#625A69]">{country.system}</p>
        </div>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-[#D9C7E8] bg-white/85 p-6 shadow-lg shadow-[#5A2D82]/5">
          <h3 className="text-sm font-bold uppercase tracking-[.14em] text-[#6F3898]">Información política</h3>

          <div className="mt-5 space-y-5">
            {politicalInfo.map((item) => (
              <div key={item.label}>
                <p className="text-xs uppercase tracking-[0.16em] text-[#867A8C]">
                  {item.label}
                </p>
                <p className="mt-2 text-lg font-semibold text-[#2A2140]">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[#D9C7E8] bg-white/85 p-6 shadow-lg shadow-[#5A2D82]/5 md:col-span-2">
          <h3 className="text-sm font-bold uppercase tracking-[.14em] text-[#6F3898]">Partidos políticos</h3>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {country.parties.map((party) => (
              <div
                key={party.name}
                className="rounded-xl border border-[#E4D8EB] bg-[#FBF9FC] p-5 transition hover:-translate-y-0.5 hover:border-[#B895CE] hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-[#30263A]">{party.name}</h4>

                    {"seats" in party && party.seats && (
                      <p className="mt-1 text-xs text-[#756A7B]">
                        {party.seats} escaños
                      </p>
                    )}
                  </div>

                  <span
                    className="text-sm font-bold"
                    style={{ color: party.color }}
                  >
                    {party.percentage}%
                  </span>
                </div>

                <div className="mt-3 h-2 w-full rounded-full bg-[#EDE5F1]">
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
