"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Candidate = { name: string; party: string; votes: number };
type Party = { name: string; votes: number };
type Summary = { totalVotes: number; validVotes: number; winner: Candidate | null; topCandidates: Candidate[]; topParties: Party[] };
type Election = { id: string; year: number; corporation: string; title: string; label: string };
type DashboardData = { department: { code: string; name: string }; elections: Election[]; data: Record<string, Record<string, Record<string, Summary>>> };

const format = (value: number) => value.toLocaleString("es-CO");
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
const partyStyle = (name: string) => {
  const value = normalize(name);
  const styles = [
    ["CAMBIO RADICAL", "CR", "#D51F36"], ["PACTO HISTORICO", "PH", "#7A2E8E"],
    ["LIBERAL", "PL", "#D71920"], ["CONSERVADOR", "PC", "#1659A7"],
    ["CENTRO DEMOCRATICO", "CD", "#48A9E6"], ["ALIANZA VERDE", "AV", "#48A942"],
    ["VERDE OXIGENO", "VO", "#73B72B"], ["PARTIDO DE LA U", "PU", "#E8B51B"],
    ["POLO", "PD", "#F2C500"], ["ASI", "ASI", "#E36B25"],
    ["MIRA", "MI", "#176BB4"], ["NUEVO LIBERALISMO", "NL", "#E53935"],
    ["DIGNIDAD", "DC", "#E05B32"], ["ECOLOGISTA", "PE", "#278A54"],
  ] as const;
  const found = styles.find(([needle]) => value.includes(needle));
  return found ? { badge: found[1], color: found[2] } : { badge: name.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join(""), color: "#6C4A7D" };
};

function PartyBadge({ name }: { name: string }) {
  const style = partyStyle(name);
  return <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[10px] font-black text-white shadow-sm" style={{ backgroundColor: style.color }}>{style.badge}</span>;
}

export default function ElectoralDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [year, setYear] = useState(2023);
  const [corporation, setCorporation] = useState("003");
  const [municipality, setMunicipality] = useState("BARRANQUILLA");

  useEffect(() => { fetch("/data/dashboard_electoral_atlantico.json").then((response) => response.json()).then(setData); }, []);
  const elections = useMemo(() => data?.elections.filter((item) => item.year === year) || [], [data, year]);
  const currentElection = elections.find((item) => item.corporation === corporation);
  const municipalities = useMemo(() => Object.keys(data?.data[String(year)]?.[corporation] || {}).sort(), [data, year, corporation]);
  const current = data?.data[String(year)]?.[corporation]?.[municipality];
  const comparisonYear = year === 2023 ? 2019 : year === 2019 ? 2023 : null;
  const comparison = comparisonYear ? data?.data[String(comparisonYear)]?.[corporation]?.[municipality] : undefined;
  const change = comparison?.totalVotes ? (((current?.totalVotes || 0) - comparison.totalVotes) / comparison.totalVotes) * 100 : null;
  const partyNames = [...new Set([...(comparison?.topParties || []).map((party) => party.name), ...(current?.topParties || []).map((party) => party.name)])].slice(0, 8);
  const maxVotes = Math.max(1, ...partyNames.flatMap((name) => [comparison?.topParties.find((party) => party.name === name)?.votes || 0, current?.topParties.find((party) => party.name === name)?.votes || 0]));

  const changeYear = (nextYear: number) => {
    const first = data?.elections.find((item) => item.year === nextYear);
    setYear(nextYear); setCorporation(first?.corporation || "001"); setMunicipality("BARRANQUILLA");
  };

  return <main className="min-h-screen bg-[#EEE2F3] px-5 py-10 text-[#281D34] lg:px-10"><div className="mx-auto max-w-[1400px]">
    <div className="flex flex-wrap items-end justify-between gap-5"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-[#7B3FB6]">Dashboard electoral</p><h1 className="mt-2 font-serif text-4xl font-bold">Análisis electoral del Atlántico</h1><p className="mt-3 max-w-3xl text-[#665B6D]">Consulta las trece elecciones disponibles y compara tendencias cuando existe la misma corporación en 2019 y 2023.</p></div><Link href="/inteligencia-electoral" className="rounded-full border border-[#5A2D82] bg-white px-5 py-2.5 text-sm font-bold text-[#5A2D82]">Volver al mapa</Link></div>

    <section className="mt-8 rounded-2xl border border-[#D7C2E2] bg-white/85 p-5 shadow-lg shadow-[#5A2D82]/5">
      <div className="mb-4 max-w-sm"><label className="mb-2 block text-xs font-bold">Departamento</label><select value="03" disabled className="h-11 w-full rounded-lg border border-[#CEB8D9] bg-[#F5EDF9] px-3 font-semibold disabled:opacity-100"><option value="03">Atlántico</option></select></div>
      <div className="grid gap-4 md:grid-cols-[160px_260px_1fr_auto] md:items-end">
        <div><label className="mb-2 block text-xs font-bold">Año</label><select value={year} onChange={(event) => changeYear(Number(event.target.value))} className="h-11 w-full rounded-lg border border-[#CEB8D9] bg-white px-3 font-semibold"><option>2019</option><option>2023</option><option>2026</option></select></div>
        <div><label className="mb-2 block text-xs font-bold">Cargo o corporación</label><select value={corporation} onChange={(event) => { setCorporation(event.target.value); setMunicipality("BARRANQUILLA"); }} className="h-11 w-full rounded-lg border border-[#CEB8D9] bg-white px-3 font-semibold">{elections.map((item) => <option key={item.id} value={item.corporation}>{item.title}</option>)}</select></div>
        <div><label className="mb-2 block text-xs font-bold">Municipio</label><select value={municipality} onChange={(event) => setMunicipality(event.target.value)} className="h-11 w-full rounded-lg border border-[#CEB8D9] bg-white px-3 font-semibold">{municipalities.map((name) => <option key={name}>{name}</option>)}</select></div>
        <div className="rounded-lg bg-[#5A2D82] px-5 py-3 text-center text-sm font-bold text-white">{currentElection?.label || "Cargando"}</div>
      </div>
    </section>

    <section className="mt-6 grid gap-4 md:grid-cols-4">{[
      { label: `Votos registrados ${year}`, value: current?.totalVotes }, { label: `Votos válidos ${year}`, value: current?.validVotes },
      { label: comparisonYear ? `Votos registrados ${comparisonYear}` : "Comparación histórica", value: comparison?.totalVotes },
      { label: "Variación", value: change === null ? "Sin año comparable" : `${change >= 0 ? "+" : ""}${change.toFixed(1)}%` },
    ].map((item) => <div key={item.label} className="rounded-2xl border border-[#D8C5E2] bg-white p-5"><p className="text-xs font-bold uppercase tracking-[.12em] text-[#786D7E]">{item.label}</p><strong className="mt-3 block text-2xl text-[#5A2D82]">{typeof item.value === "number" ? format(item.value) : item.value || "—"}</strong></div>)}</section>

    <section className={`mt-6 grid gap-6 ${comparison ? "lg:grid-cols-2" : ""}`}>
      {[...(comparison ? [{ year: comparisonYear!, summary: comparison }] : []), { year, summary: current }].map(({ year: resultYear, summary }) => <article key={resultYear} className="rounded-2xl border border-[#D8C5E2] bg-white p-6 shadow-md shadow-[#5A2D82]/5"><div className="flex items-center justify-between"><h2 className="font-serif text-2xl font-bold">Resultado {resultYear}</h2><span className="rounded-full bg-[#F0E3F6] px-3 py-1 text-xs font-bold text-[#5A2D82]">Top 5</span></div>{summary?.winner && <div className="mt-5 rounded-xl bg-gradient-to-r from-[#5A2D82] to-[#8A55AA] p-5 text-white"><p className="text-xs uppercase tracking-[.15em] text-white/70">Mayor votación</p><strong className="mt-2 block text-xl">{summary.winner.name}</strong><span className="mt-2 flex items-center gap-2 text-sm text-white/85"><PartyBadge name={summary.winner.party} />{summary.winner.party} · {format(summary.winner.votes)} votos</span></div>}<div className="mt-4">{summary?.topCandidates.slice(0, 5).map((candidate, index) => <div key={`${candidate.name}-${index}`} className="grid grid-cols-[28px_1fr_auto] items-center gap-3 border-b border-[#EEE7F1] py-3"><span className="grid h-7 w-7 place-items-center rounded-full bg-[#F1E6F6] text-xs font-bold text-[#5A2D82]">{index + 1}</span><span><b className="block text-sm">{candidate.name}</b><small className="mt-1 flex items-center gap-2 text-[#756A7B]"><PartyBadge name={candidate.party} />{candidate.party}</small></span><strong>{format(candidate.votes)}</strong></div>)}</div></article>)}
    </section>

    <section className="mt-6 rounded-2xl border border-[#D8C5E2] bg-white p-6"><h2 className="font-serif text-2xl font-bold">Tendencia de partidos</h2><p className="mt-2 text-sm text-[#6A6071]">Los colores e insignias permiten identificar cada organización. Las dos barras comparan años cuando hay información equivalente.</p><div className="mt-6 space-y-5">{partyNames.map((name) => { const previousVotes = comparison?.topParties.find((party) => party.name === name)?.votes || 0; const currentVotes = current?.topParties.find((party) => party.name === name)?.votes || 0; const style = partyStyle(name); return <div key={name}><div className="mb-2 flex flex-wrap items-center justify-between gap-3 text-sm"><span className="flex items-center gap-2"><PartyBadge name={name} /><b>{name}</b></span><span className="text-[#756A7B]">{comparisonYear ? `${comparisonYear}: ${format(previousVotes)} · ` : ""}{year}: {format(currentVotes)}</span></div>{comparison && <div className="mb-1 h-2 rounded-full bg-[#EFE9F2]"><div className="h-2 rounded-full opacity-40" style={{ width: `${(previousVotes / maxVotes) * 100}%`, backgroundColor: style.color }} /></div>}<div className="h-2 rounded-full bg-[#EFE9F2]"><div className="h-2 rounded-full" style={{ width: `${(currentVotes / maxVotes) * 100}%`, backgroundColor: style.color }} /></div></div>; })}</div></section>

    <section className="mt-6 rounded-2xl bg-[#2D1D3B] p-7 text-white"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#D5B5E6]">Próxima fase</p><h2 className="mt-2 text-2xl font-bold">Intención de voto + histórico electoral</h2><p className="mt-3 max-w-3xl text-white/75">La futura base privada permitirá comparar compromisos registrados y comportamiento histórico agregado del puesto, protegiendo la información personal del votante.</p></section>
  </div></main>;
}
