"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Candidate = { name: string; party: string; votes: number };
type Party = { name: string; votes: number };
type Summary = { totalVotes: number; validVotes: number; winner: Candidate | null; topCandidates: Candidate[]; topParties: Party[] };
type DashboardData = { years: number[]; corporations: Record<string, string>; data: Record<string, Record<string, Record<string, Summary>>> };

const format = (value: number) => value.toLocaleString("es-CO");

export default function ElectoralDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [corporation, setCorporation] = useState("003");
  const [municipality, setMunicipality] = useState("BARRANQUILLA");

  useEffect(() => { fetch("/data/comparativo_territorial_2019_2023.json").then((response) => response.json()).then(setData); }, []);

  const municipalities = useMemo(() => data ? [...new Set([...
    Object.keys(data.data["2019"]?.[corporation] || {}), ...Object.keys(data.data["2023"]?.[corporation] || {})
  ])].sort() : [], [data, corporation]);
  const oldData = data?.data["2019"]?.[corporation]?.[municipality];
  const newData = data?.data["2023"]?.[corporation]?.[municipality];
  const change = oldData?.totalVotes ? (((newData?.totalVotes || 0) - oldData.totalVotes) / oldData.totalVotes) * 100 : 0;
  const partyNames = [...new Set([...(oldData?.topParties || []).map((party) => party.name), ...(newData?.topParties || []).map((party) => party.name)])].slice(0, 7);
  const maxPartyVotes = Math.max(1, ...partyNames.flatMap((name) => [oldData?.topParties.find((party) => party.name === name)?.votes || 0, newData?.topParties.find((party) => party.name === name)?.votes || 0]));

  return (
    <main className="min-h-screen bg-[#EEE2F3] px-5 py-10 text-[#281D34] lg:px-10">
      <div className="mx-auto max-w-[1400px]">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div><p className="text-xs font-bold uppercase tracking-[.2em] text-[#7B3FB6]">Dashboard electoral</p><h1 className="mt-2 font-serif text-4xl font-bold">Comparativo territorial 2019–2023</h1><p className="mt-3 max-w-3xl text-[#665B6D]">Analiza cambios de votación, ganadores y tendencias partidistas por municipio del Atlántico.</p></div>
          <Link href="/inteligencia-electoral" className="rounded-full border border-[#5A2D82] bg-white px-5 py-2.5 text-sm font-bold text-[#5A2D82]">Volver al mapa</Link>
        </div>

        <section className="mt-8 grid gap-4 rounded-2xl border border-[#D7C2E2] bg-white/85 p-5 shadow-lg shadow-[#5A2D82]/5 md:grid-cols-[180px_200px_1fr_auto] md:items-end">
          <div><label className="mb-2 block text-xs font-bold">Departamento</label><select value="03" disabled className="h-11 w-full rounded-lg border border-[#CEB8D9] bg-white px-3 font-semibold text-[#34283E] disabled:opacity-100"><option value="03">Atlántico</option></select></div>
          <div><label className="mb-2 block text-xs font-bold">Tipo de elección</label><select value={corporation} onChange={(event) => { setCorporation(event.target.value); setMunicipality("BARRANQUILLA"); }} className="h-11 w-full rounded-lg border border-[#CEB8D9] bg-white px-3 font-semibold"><option value="003">Alcaldes</option><option value="001">Gobernación</option></select></div>
          <div><label className="mb-2 block text-xs font-bold">Municipio</label><select value={municipality} onChange={(event) => setMunicipality(event.target.value)} className="h-11 w-full rounded-lg border border-[#CEB8D9] bg-white px-3 font-semibold">{municipalities.map((name) => <option key={name}>{name}</option>)}</select></div>
          <div className="rounded-lg bg-[#5A2D82] px-5 py-3 text-center text-sm font-bold text-white">{data?.corporations[corporation] || "Cargando"} · {municipality}</div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-4">
          {[{ label: "Votos registrados 2019", value: oldData?.totalVotes }, { label: "Votos registrados 2023", value: newData?.totalVotes }, { label: "Cambio entre años", value: `${change >= 0 ? "+" : ""}${change.toFixed(1)}%` }, { label: "Votos válidos 2023", value: newData?.validVotes }].map((item) => <div key={item.label} className="rounded-2xl border border-[#D8C5E2] bg-white p-5"><p className="text-xs font-bold uppercase tracking-[.12em] text-[#786D7E]">{item.label}</p><strong className="mt-3 block text-3xl text-[#5A2D82]">{typeof item.value === "number" ? format(item.value) : item.value || "—"}</strong></div>)}
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          {[{ year: 2019, summary: oldData }, { year: 2023, summary: newData }].map(({ year, summary }) => <article key={year} className="rounded-2xl border border-[#D8C5E2] bg-white p-6 shadow-md shadow-[#5A2D82]/5"><div className="flex items-center justify-between"><h2 className="font-serif text-2xl font-bold">Resultado {year}</h2><span className="rounded-full bg-[#F0E3F6] px-3 py-1 text-xs font-bold text-[#5A2D82]">Top 5</span></div>{summary?.winner && <div className="mt-5 rounded-xl bg-gradient-to-r from-[#5A2D82] to-[#8A55AA] p-5 text-white"><p className="text-xs uppercase tracking-[.15em] text-white/70">Ganador</p><strong className="mt-2 block text-xl">{summary.winner.name}</strong><span className="mt-1 block text-sm text-white/80">{summary.winner.party} · {format(summary.winner.votes)} votos</span></div>}<div className="mt-4">{summary?.topCandidates.map((candidate, index) => <div key={`${candidate.name}-${index}`} className="grid grid-cols-[28px_1fr_auto] items-center gap-3 border-b border-[#EEE7F1] py-3"><span className="grid h-7 w-7 place-items-center rounded-full bg-[#F1E6F6] text-xs font-bold text-[#5A2D82]">{index + 1}</span><span><b className="block text-sm">{candidate.name}</b><small className="text-[#756A7B]">{candidate.party}</small></span><strong>{format(candidate.votes)}</strong></div>)}</div></article>)}
        </section>

        <section className="mt-6 rounded-2xl border border-[#D8C5E2] bg-white p-6"><h2 className="font-serif text-2xl font-bold">Tendencia de partidos</h2><p className="mt-2 text-sm text-[#6A6071]">Comparación de votos de las principales organizaciones en el municipio seleccionado.</p><div className="mt-6 space-y-5">{partyNames.map((name) => { const votes2019 = oldData?.topParties.find((party) => party.name === name)?.votes || 0; const votes2023 = newData?.topParties.find((party) => party.name === name)?.votes || 0; return <div key={name}><div className="mb-2 flex justify-between gap-3 text-sm"><b>{name}</b><span className="text-[#756A7B]">2019: {format(votes2019)} · 2023: {format(votes2023)}</span></div><div className="space-y-1"><div className="h-2 rounded-full bg-[#EFE9F2]"><div className="h-2 rounded-full bg-[#AA7AC1]" style={{ width: `${(votes2019 / maxPartyVotes) * 100}%` }} /></div><div className="h-2 rounded-full bg-[#EFE9F2]"><div className="h-2 rounded-full bg-[#5A2D82]" style={{ width: `${(votes2023 / maxPartyVotes) * 100}%` }} /></div></div></div>; })}</div><div className="mt-5 flex gap-5 text-xs text-[#6A6071]"><span>● <b className="text-[#AA7AC1]">2019</b></span><span>● <b className="text-[#5A2D82]">2023</b></span></div></section>

        <section className="mt-6 rounded-2xl bg-[#2D1D3B] p-7 text-white"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#D5B5E6]">Próxima fase</p><h2 className="mt-2 text-2xl font-bold">Intención de voto + histórico electoral</h2><p className="mt-3 max-w-3xl text-white/75">Cuando activemos la base privada de simpatizantes, este dashboard comparará compromisos registrados, distribución territorial e histórico del puesto sin afirmar cómo votó una persona individual.</p></section>
      </div>
    </main>
  );
}
