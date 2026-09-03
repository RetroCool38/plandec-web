"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Position = [number, number];
type Municipality = { geometry: { coordinates: Position[][] }; properties: { MpCodigo: string; MpNombre: string } };
type Place = { geometry: { coordinates: Position }; properties: { municipio: string; puesto: string; direccion: string; codigo_municipio_electoral: string; codigo_zona: string; codigo_puesto: string } };
type Result = { candidato: string; partido: string; codigo: string; votos: number };
type Election = { id: string; year: number; corporation: string; title: string; label: string; file: string; places: number };

const W = 900, H = 930;
const bounds = { minLon: -75.273, maxLon: -74.686, minLat: 10.24, maxLat: 11.11 };
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
const electionOptionLabel = (title: string) => ({
  "Gobernación": "Gobernador",
  "Alcaldía": "Alcalde",
  "Concejo": "Concejo / concejales",
}[title] || title);
const project = ([lon, lat]: Position): Position => [
  ((lon - bounds.minLon) / (bounds.maxLon - bounds.minLon)) * W,
  H - ((lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * H,
];
const polygonPath = (feature: Municipality) => feature.geometry.coordinates
  .map((ring) => ring.map((point, index) => `${index ? "L" : "M"}${project(point).join(",")}`).join(" ") + " Z")
  .join(" ");

export default function ElectoralIntelligencePage() {
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [results, setResults] = useState<Record<string, Result[]>>({});
  const [elections, setElections] = useState<Election[]>([]);
  const [selectedElection, setSelectedElection] = useState("2023-001");
  const [pendingYear, setPendingYear] = useState(2023);
  const [pendingElection, setPendingElection] = useState("2023-001");
  const [resultsLoading, setResultsLoading] = useState(false);
  const [municipality, setMunicipality] = useState("BARRANQUILLA");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Place | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/data/municipios_atlantico.geojson").then((response) => response.json()),
      fetch("/data/puestos_votacion_atlantico_2023.geojson").then((response) => response.json()),
      fetch("/data/elecciones_atlantico.json").then((response) => response.json()),
    ]).then(([municipalityData, placeData, electionData]) => {
      setMunicipalities(municipalityData.features);
      setPlaces(placeData.features);
      setElections(electionData);
    }).catch(() => setError("No fue posible cargar la información electoral."));
  }, []);

  const activeElection = elections.find((election) => election.id === selectedElection);
  const years = useMemo(() => [...new Set(elections.map((election) => election.year))].sort(), [elections]);
  const electionTypes = useMemo(() => elections.filter((election) => election.year === pendingYear), [elections, pendingYear]);

  useEffect(() => {
    if (!activeElection) return;
    setResultsLoading(true);
    setResults({});
    setSelected(null);
    fetch(activeElection.file)
      .then((response) => response.json())
      .then(setResults)
      .catch(() => setError("No fue posible cargar los resultados seleccionados."))
      .finally(() => setResultsLoading(false));
  }, [activeElection]);

  const names = useMemo(() => [...new Set(places.map((place) => place.properties.municipio))].sort(), [places]);
  const filtered = useMemo(() => places.filter((place) => {
    const inMunicipality = municipality === "TODOS" || place.properties.municipio === municipality;
    const needle = normalize(query.trim());
    return inMunicipality && (!needle || normalize(`${place.properties.puesto} ${place.properties.direccion}`).includes(needle));
  }), [places, municipality, query]);
  const resultKey = selected ? `${selected.properties.codigo_municipio_electoral}-${selected.properties.codigo_zona}-${selected.properties.codigo_puesto}` : "";
  const candidates = (results[resultKey] || []).filter((result) => {
    const candidateCode = result.codigo.split("-").at(-1) || "";
    return !["996", "997", "998", "00996", "00997", "00998"].includes(candidateCode);
  }).slice(0, 5);

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#E9DDF0] text-[#261B33]">
      <div className="border-b border-[#CDAFDC] bg-gradient-to-r from-[#F8F2FB] via-[#EAD8F3] to-[#DCC1EA] px-5 py-7 lg:px-10">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-end justify-between gap-4">
          <div><p className="text-xs font-bold uppercase tracking-[.2em] text-[#7B3FB6]">Inteligencia electoral</p><h1 className="mt-2 font-serif text-3xl font-bold lg:text-4xl">Mapa electoral del Atlántico</h1><p className="mt-2 text-sm text-[#6A6071]">Compara resultados por puesto de las elecciones territoriales de 2019 y 2023 y del Congreso de 2026.</p></div>
          <div className="flex flex-wrap gap-3"><Link href="/inteligencia-electoral/dashboard" className="grid place-items-center rounded-lg bg-[#5A2D82] px-5 py-2 text-sm font-bold text-white shadow-md">Ver dashboard</Link><div className="border-l-2 border-[#7B3FB6] bg-[#F6F0FA] px-4 py-2"><strong className="block text-xl">{activeElection?.places || "—"}</strong><span className="text-xs text-[#6A6071]">puestos con resultados</span></div><div className="border-l-2 border-[#C99A34] bg-[#FCF8EF] px-4 py-2"><strong className="block text-xl">23</strong><span className="text-xs text-[#6A6071]">municipios</span></div></div>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1500px] lg:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="flex max-h-[760px] flex-col border-r border-[#C9ADD8] bg-[#FBF8FC] p-5 lg:min-h-[760px]">
          <form onSubmit={(event) => { event.preventDefault(); setSelectedElection(pendingElection); }} className="mb-5 rounded-xl border border-[#DFCDE9] bg-[#F3E8F8] p-3 shadow-sm">
            <div className="mb-3"><label className="mb-2 block text-xs font-bold" htmlFor="departamento">Departamento</label><select id="departamento" value="03" disabled className="h-10 w-full rounded-lg border border-[#CDB7D9] bg-white px-3 text-sm font-semibold text-[#34283E] disabled:opacity-100"><option value="03">Atlántico</option></select></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="mb-2 block text-xs font-bold" htmlFor="anio">Año</label><select id="anio" value={pendingYear} onChange={(event) => { const year = Number(event.target.value); const first = elections.find((election) => election.year === year); setPendingYear(year); if (first) setPendingElection(first.id); }} className="h-10 w-full rounded-lg border border-[#CDB7D9] bg-white px-2 text-sm font-semibold outline-none focus:border-[#7B3FB6]">{years.map((year) => <option key={year}>{year}</option>)}</select></div>
              <div><label className="mb-2 block text-xs font-bold" htmlFor="corporacion">Cargo o corporación</label><select id="corporacion" value={pendingElection} onChange={(event) => setPendingElection(event.target.value)} className="h-10 w-full rounded-lg border border-[#CDB7D9] bg-white px-2 text-sm font-semibold outline-none focus:border-[#7B3FB6]">{electionTypes.map((election) => <option key={election.id} value={election.id}>{electionOptionLabel(election.title)}</option>)}</select></div>
            </div>
            <button type="submit" className="mt-3 w-full rounded-lg bg-[#5A2D82] px-4 py-3 text-sm font-bold text-white shadow-md shadow-[#5A2D82]/20 transition hover:bg-[#7138A3]">Consultar resultados</button>
            <p className="mt-2 text-center text-[11px] text-[#6A6071]">Consulta activa: <strong className="text-[#5A2D82]">Atlántico · {activeElection?.label || "Cargando…"}</strong></p>
          </form>
          <label className="mb-2 text-xs font-bold" htmlFor="municipio">Municipio</label>
          <select id="municipio" value={municipality} onChange={(event) => { setMunicipality(event.target.value); setSelected(null); }} className="mb-4 h-11 rounded-lg border border-[#D9CEE1] bg-white px-3 text-sm outline-none focus:border-[#7B3FB6]">
            <option value="TODOS">Todos los municipios</option>{names.map((name) => <option key={name}>{name}</option>)}
          </select>
          <label className="mb-2 text-xs font-bold" htmlFor="buscar">Buscar puesto o dirección</label>
          <input id="buscar" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ej. Colegio Nazareth" className="mb-4 h-11 rounded-lg border border-[#D9CEE1] px-3 text-sm outline-none focus:border-[#7B3FB6]" />
          <div className="mb-2 flex justify-between border-b border-[#E9E2ED] pb-2 text-xs"><strong>Resultados</strong><span className="text-[#756A7B]">{filtered.length} puestos</span></div>
          <div className="overflow-y-auto">{filtered.slice(0, 100).map((place) => {
            const code = `${place.properties.codigo_zona}-${place.properties.codigo_puesto}`;
            return <button key={`${place.properties.municipio}-${code}`} onClick={() => setSelected(place)} className={`block w-full border-b border-[#F0EBF3] px-2 py-3 text-left transition hover:bg-[#F7F1FA] ${selected === place ? "bg-[#F1E7F7]" : ""}`}><strong className="block text-xs leading-5">{place.properties.puesto}</strong><span className="mt-1 block text-[11px] text-[#746A7A]">{place.properties.municipio} · Zona {code}</span></button>;
          })}</div>
        </aside>

        <section className="relative min-h-[680px] overflow-hidden bg-[radial-gradient(circle_at_55%_42%,#F8F1FB_0%,#DDC8E8_58%,#C9AAD9_100%)]">
          {error ? <div className="grid h-full place-items-center text-sm text-red-700">{error}</div> : !places.length ? <div className="grid h-full place-items-center text-sm text-[#6A6071]">Preparando mapa…</div> : (
            <svg viewBox={`-35 -35 ${W + 70} ${H + 70}`} className="mx-auto h-[700px] w-full max-w-[720px] p-5" role="img" aria-label="Mapa interactivo de puestos de votación del Atlántico">
              <g>{municipalities.map((feature) => <path key={feature.properties.MpCodigo} d={polygonPath(feature)} className={`stroke-[#74458E] [stroke-width:1.55] ${municipality !== "TODOS" && normalize(feature.properties.MpNombre) === normalize(municipality) ? "fill-[#B985CE]" : "fill-[#F1E5F6]"}`} />)}</g>
              <g>{filtered.map((place) => { const [cx, cy] = project(place.geometry.coordinates); return <circle key={`${place.properties.codigo_municipio_electoral}-${place.properties.codigo_zona}-${place.properties.codigo_puesto}`} cx={cx} cy={cy} r={selected === place ? 10 : 5.2} onClick={() => setSelected(place)} className={`cursor-pointer stroke-white [stroke-width:2] ${selected === place ? "fill-[#C99A34]" : "fill-[#5A2D82] hover:fill-[#C99A34]"}`}><title>{place.properties.puesto}</title></circle>; })}</g>
            </svg>
          )}

          {selected && <aside className="absolute right-4 top-4 max-h-[650px] w-[min(370px,calc(100%-2rem))] overflow-y-auto border-t-4 border-[#5A2D82] bg-white p-6 shadow-2xl">
            <button onClick={() => setSelected(null)} className="absolute right-4 top-3 h-8 w-8 rounded-full bg-[#F1ECF4] text-sm" aria-label="Cerrar">×</button>
            <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#7B3FB6]">Puesto de votación</p><h2 className="mr-8 mt-2 font-serif text-2xl font-bold leading-tight">{selected.properties.puesto}</h2><p className="mt-3 border-b border-[#E8E0EC] pb-4 text-sm text-[#6A6071]">{selected.properties.direccion}</p>
            <dl className="my-3 text-xs"><div className="flex justify-between border-b border-[#EEE8F1] py-2"><dt>Municipio</dt><dd className="font-bold">{selected.properties.municipio}</dd></div><div className="flex justify-between border-b border-[#EEE8F1] py-2"><dt>Zona / puesto</dt><dd className="font-bold">{selected.properties.codigo_zona} / {selected.properties.codigo_puesto}</dd></div></dl>
            <div className="mt-5 flex items-end justify-between"><h3 className="font-serif font-bold">{activeElection?.label}</h3><span className="text-[10px] text-[#756A7B]">votos por puesto</span></div>
            <div className="mt-2">{resultsLoading ? <p className="py-6 text-center text-xs text-[#756A7B]">Cargando resultados…</p> : candidates.length ? candidates.map((candidate, index) => <div key={candidate.codigo} className="grid grid-cols-[24px_1fr_auto] items-center gap-2 border-b border-[#EEE8F1] py-2"><span className="grid h-6 w-6 place-items-center rounded-full bg-[#F1E7F7] text-[10px] font-bold text-[#5A2D82]">{index + 1}</span><span><strong className="block text-[11px] leading-tight">{candidate.candidato}</strong><small className="mt-1 block text-[9px] text-[#756A7B]">{candidate.partido}</small></span><b className="text-sm">{candidate.votos.toLocaleString("es-CO")}</b></div>) : <p className="py-6 text-center text-xs text-[#756A7B]">Este puesto no tiene resultados asociados para la elección seleccionada.</p>}</div>
            <p className="mt-4 text-center text-[10px] text-[#756A7B]">Resultados agregados de todas las mesas del puesto.</p>
          </aside>}
        </section>
      </div>
    </div>
  );
}
