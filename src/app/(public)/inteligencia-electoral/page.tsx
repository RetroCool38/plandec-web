"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Position = [number, number];
type Geometry = {
  type: "Polygon" | "MultiPolygon";
  coordinates: Position[][] | Position[][][];
};
type Municipality = { geometry: Geometry | null; properties: Record<string, string> };
type Place = { geometry: { coordinates: Position }; properties: { municipio: string; puesto: string; direccion: string; codigo_municipio_electoral: string; codigo_zona: string; codigo_puesto: string; mesas?: number; comuna?: string } };
type Result = { candidato: string; partido: string; codigo: string; votos: number };
type Election = { id: string; year: number; corporation: string; title: string; label: string; file: string; places: number };
type Department = { id: string; name: string; title: string; map: string; places: string; elections?: string; municipalities: number; resultsAvailable: boolean };

const W = 900;
const H = 760;
const departments: Department[] = [
  { id: "atlantico", name: "Atlántico", title: "del Atlántico", map: "/data/municipios_atlantico.geojson", places: "/data/puestos_votacion_atlantico_2023.geojson", elections: "/data/elecciones_atlantico.json", municipalities: 23, resultsAvailable: true },
  { id: "norte-de-santander", name: "Norte de Santander", title: "de Norte de Santander", map: "/data/municipios_norte_de_santander.geojson?v=20261018", places: "/data/puestos_votacion_norte_de_santander_2023.geojson?v=20261018", elections: "/data/elecciones_norte_de_santander.json?v=20261018", municipalities: 40, resultsAvailable: true },
  { id: "bogota-dc", name: "Bogotá D. C.", title: "de Bogotá D. C.", map: "/data/bogota_dc.geojson?v=20261018", places: "/data/puestos_votacion_bogota_2023.geojson?v=20261018", municipalities: 1, resultsAvailable: false },
  { id: "cundinamarca", name: "Cundinamarca", title: "de Cundinamarca", map: "/data/municipios_cundinamarca.geojson?v=20261018", places: "/data/puestos_votacion_cundinamarca_2023.geojson?v=20261018", municipalities: 116, resultsAvailable: false },
];

const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
const featureId = (feature: Municipality) => feature.properties.MpCodigo || feature.properties.MPIO_CDPMP || feature.properties.OBJECTID;
const featureName = (feature: Municipality) => feature.properties.MpNombre || feature.properties.MPIO_CNMBRE || feature.properties.DPTO_CNMBRE || "Territorio";
const ringsFor = (feature: Municipality): Position[][] => {
  if (!feature.geometry) return [];
  return feature.geometry.type === "Polygon"
    ? feature.geometry.coordinates as Position[][]
    : (feature.geometry.coordinates as Position[][][]).flat();
};
const electionOptionLabel = (title: string) => ({
  "Gobernación": "Gobernador",
  "Alcaldía": "Alcalde",
  "Concejo": "Concejo / concejales",
}[title] || title);

export default function ElectoralIntelligencePage() {
  const [departmentId, setDepartmentId] = useState("atlantico");
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [results, setResults] = useState<Record<string, Result[]>>({});
  const [elections, setElections] = useState<Election[]>([]);
  const [selectedElection, setSelectedElection] = useState("2023-001");
  const [pendingYear, setPendingYear] = useState(2023);
  const [pendingElection, setPendingElection] = useState("2023-001");
  const [mapLoading, setMapLoading] = useState(true);
  const [resultsLoading, setResultsLoading] = useState(true);
  const [municipality, setMunicipality] = useState("BARRANQUILLA");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Place | null>(null);
  const [error, setError] = useState("");

  const department = departments.find((item) => item.id === departmentId) || departments[0];

  useEffect(() => {
    let cancelled = false;
    setMapLoading(true);
    setError("");
    setMunicipalities([]);
    setPlaces([]);
    setElections([]);
    setResults({});
    setSelected(null);
    setQuery("");
    setMunicipality(department.id === "atlantico" ? "BARRANQUILLA" : "TODOS");

    const requests: Promise<Response>[] = [fetch(department.map), fetch(department.places)];
    if (department.resultsAvailable && department.elections) {
      requests.push(fetch(department.elections));
    }

    Promise.all(requests)
      .then(async (responses) => {
        if (responses.some((response) => !response.ok)) throw new Error("Respuesta incompleta");
        const payloads = await Promise.all(responses.map((response) => response.json()));
        if (cancelled) return;
        setMunicipalities(payloads[0].features.filter((feature: Municipality) => feature.geometry));
        setPlaces(payloads[1].features);
        if (department.resultsAvailable) {
          setElections(payloads[2]);
        }
      })
      .catch(() => !cancelled && setError("No fue posible cargar el mapa seleccionado."))
      .finally(() => !cancelled && setMapLoading(false));

    return () => { cancelled = true; };
  }, [department.id, department.map, department.places, department.elections, department.resultsAvailable]);

  const activeElection = elections.find((election) => election.id === selectedElection);
  const years = useMemo(() => [...new Set(elections.map((election) => election.year))].sort(), [elections]);
  const electionTypes = useMemo(() => elections.filter((election) => election.year === pendingYear), [elections, pendingYear]);

  useEffect(() => {
    if (!department.resultsAvailable || !activeElection) return;
    let cancelled = false;
    fetch(activeElection.file)
      .then((response) => {
        if (!response.ok) throw new Error("Respuesta incompleta");
        return response.json();
      })
      .then((data) => !cancelled && setResults(data))
      .catch(() => !cancelled && setError("No fue posible cargar los resultados seleccionados."))
      .finally(() => !cancelled && setResultsLoading(false));
    return () => { cancelled = true; };
  }, [activeElection, department.resultsAvailable]);

  const projection = useMemo(() => {
    const points = municipalities.flatMap((feature) => ringsFor(feature).flat());
    if (!points.length) return ([lon, lat]: Position): Position => [lon, lat];
    const longitudes = points.map(([lon]) => lon);
    const latitudes = points.map(([, lat]) => lat);
    const minLon = Math.min(...longitudes), maxLon = Math.max(...longitudes);
    const minLat = Math.min(...latitudes), maxLat = Math.max(...latitudes);
    const lonSpan = Math.max(maxLon - minLon, 0.01);
    const latSpan = Math.max(maxLat - minLat, 0.01);
    const scale = Math.min((W - 80) / lonSpan, (H - 80) / latSpan);
    const drawnWidth = lonSpan * scale;
    const drawnHeight = latSpan * scale;
    const offsetX = (W - drawnWidth) / 2;
    const offsetY = (H - drawnHeight) / 2;
    return ([lon, lat]: Position): Position => [
      offsetX + (lon - minLon) * scale,
      H - offsetY - (lat - minLat) * scale,
    ];
  }, [municipalities]);

  const polygonPath = (feature: Municipality) => ringsFor(feature)
    .map((ring) => ring.map((point, index) => `${index ? "L" : "M"}${projection(point).join(",")}`).join(" ") + " Z")
    .join(" ");

  const names = useMemo(() => {
    const source = places.length ? places.map((place) => place.properties.municipio) : municipalities.map(featureName);
    return [...new Set(source)].sort((a, b) => a.localeCompare(b, "es"));
  }, [municipalities, places]);
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

  const changeDepartment = (id: string) => {
    setDepartmentId(id);
    if (departments.find((item) => item.id === id)?.resultsAvailable) {
      setPendingYear(2023);
      setPendingElection("2023-001");
      setSelectedElection("2023-001");
      setResultsLoading(true);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#E9DDF0] text-[#261B33]">
      <div className="border-b border-[#CDAFDC] bg-gradient-to-r from-[#F8F2FB] via-[#EAD8F3] to-[#DCC1EA] px-5 py-7 lg:px-10">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-end justify-between gap-4">
          <div><p className="text-xs font-bold uppercase tracking-[.2em] text-[#7B3FB6]">Inteligencia electoral</p><h1 className="mt-2 font-serif text-3xl font-bold lg:text-4xl">Mapa electoral {department.title}</h1><p className="mt-2 text-sm text-[#6A6071]">Consulta territorios, puestos y resultados históricos para orientar el trabajo de campaña.</p></div>
          <div className="flex flex-wrap gap-3"><Link href="/inteligencia-electoral/dashboard" className="grid place-items-center rounded-lg bg-[#5A2D82] px-5 py-2 text-sm font-bold text-white shadow-md">Ver dashboard</Link><div className="border-l-2 border-[#7B3FB6] bg-[#F6F0FA] px-4 py-2"><strong className="block text-xl">{places.length || "—"}</strong><span className="text-xs text-[#6A6071]">puestos georreferenciados</span></div><div className="border-l-2 border-[#C99A34] bg-[#FCF8EF] px-4 py-2"><strong className="block text-xl">{department.municipalities}</strong><span className="text-xs text-[#6A6071]">{department.id === "bogota-dc" ? "Distrito Capital" : "municipios"}</span></div></div>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1500px] lg:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="flex max-h-[760px] flex-col border-r border-[#C9ADD8] bg-[#FBF8FC] p-5 lg:min-h-[760px]">
          <form onSubmit={(event) => { event.preventDefault(); if (!department.resultsAvailable) return; setResultsLoading(true); setResults({}); setSelected(null); setSelectedElection(pendingElection); }} className="mb-5 rounded-xl border border-[#DFCDE9] bg-[#F3E8F8] p-3 shadow-sm">
            <div className="mb-3"><label className="mb-2 block text-xs font-bold" htmlFor="departamento">Departamento o distrito</label><select id="departamento" value={departmentId} onChange={(event) => changeDepartment(event.target.value)} className="h-10 w-full rounded-lg border border-[#CDB7D9] bg-white px-3 text-sm font-semibold text-[#34283E] outline-none focus:border-[#7B3FB6]">{departments.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="mb-2 block text-xs font-bold" htmlFor="anio">Año</label><select id="anio" value={department.resultsAvailable ? pendingYear : ""} disabled={!department.resultsAvailable} onChange={(event) => { const year = Number(event.target.value); const first = elections.find((election) => election.year === year); setPendingYear(year); if (first) setPendingElection(first.id); }} className="h-10 w-full rounded-lg border border-[#CDB7D9] bg-white px-2 text-sm font-semibold outline-none focus:border-[#7B3FB6] disabled:bg-[#EEE7F1] disabled:text-[#82768A]"><option value="">En proceso</option>{years.map((year) => <option key={year}>{year}</option>)}</select></div>
              <div><label className="mb-2 block text-xs font-bold" htmlFor="corporacion">Cargo o corporación</label><select id="corporacion" value={department.resultsAvailable ? pendingElection : ""} disabled={!department.resultsAvailable} onChange={(event) => setPendingElection(event.target.value)} className="h-10 w-full rounded-lg border border-[#CDB7D9] bg-white px-2 text-sm font-semibold outline-none focus:border-[#7B3FB6] disabled:bg-[#EEE7F1] disabled:text-[#82768A]"><option value="">En proceso</option>{electionTypes.map((election) => <option key={election.id} value={election.id}>{electionOptionLabel(election.title)}</option>)}</select></div>
            </div>
            <button type="submit" disabled={!department.resultsAvailable} className="mt-3 w-full rounded-lg bg-[#5A2D82] px-4 py-3 text-sm font-bold text-white shadow-md shadow-[#5A2D82]/20 transition hover:bg-[#7138A3] disabled:cursor-not-allowed disabled:bg-[#A997B6]">{department.resultsAvailable ? "Consultar resultados" : "Resultados en preparación"}</button>
            <p className="mt-2 text-center text-[11px] text-[#6A6071]">{department.resultsAvailable ? <>Consulta activa: <strong className="text-[#5A2D82]">{department.name} · {activeElection?.label || "Cargando…"}</strong></> : <>Puestos y mesas 2023 disponibles · históricos en preparación</>}</p>
          </form>
          <label className="mb-2 text-xs font-bold" htmlFor="municipio">Municipio</label>
          <select id="municipio" value={municipality} onChange={(event) => { setMunicipality(event.target.value); setSelected(null); }} className="mb-4 h-11 rounded-lg border border-[#D9CEE1] bg-white px-3 text-sm outline-none focus:border-[#7B3FB6]">
            <option value="TODOS">{department.id === "bogota-dc" ? "Bogotá D. C." : "Todos los municipios"}</option>{department.id !== "bogota-dc" && names.map((name) => <option key={name}>{name}</option>)}
          </select>
          <label className="mb-2 text-xs font-bold" htmlFor="buscar">Buscar puesto o dirección</label>
          <input id="buscar" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ej. Colegio Nazareth" className="mb-4 h-11 rounded-lg border border-[#D9CEE1] px-3 text-sm outline-none focus:border-[#7B3FB6]" />
          {!department.resultsAvailable && <div className="mb-3 rounded-lg border border-[#DFCDE9] bg-white px-3 py-2 text-[11px] leading-5 text-[#665B6D]"><strong className="text-[#5A2D82]">Puestos y mesas cargados.</strong> Los resultados por candidato están en preparación.</div>}
          <div className="mb-2 flex justify-between border-b border-[#E9E2ED] pb-2 text-xs"><strong>Puestos de votación</strong><span className="text-[#756A7B]">{filtered.length} puestos</span></div>
          <div className="overflow-y-auto">{filtered.slice(0, 200).map((place) => {
            const code = place.properties.codigo_zona && place.properties.codigo_puesto ? `${place.properties.codigo_zona}-${place.properties.codigo_puesto}` : "";
            return <button key={`${place.properties.municipio}-${place.properties.puesto}-${code}`} onClick={() => setSelected(place)} className={`block w-full border-b border-[#F0EBF3] px-2 py-3 text-left transition hover:bg-[#F7F1FA] ${selected === place ? "bg-[#F1E7F7]" : ""}`}><strong className="block text-xs leading-5">{place.properties.puesto}</strong><span className="mt-1 block text-[11px] text-[#746A7A]">{place.properties.municipio}{code ? ` · Zona ${code}` : ""}{place.properties.mesas ? ` · ${place.properties.mesas} mesas` : ""}</span></button>;
          })}</div>
        </aside>

        <section className="relative min-h-[680px] overflow-hidden bg-[radial-gradient(circle_at_55%_42%,#F8F1FB_0%,#DDC8E8_58%,#C9AAD9_100%)]">
          {error ? <div className="grid h-full place-items-center text-sm text-red-700">{error}</div> : mapLoading ? <div className="grid h-full place-items-center text-sm text-[#6A6071]">Preparando mapa…</div> : (
            <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto h-[700px] w-full max-w-[900px] p-5" role="img" aria-label={`Mapa electoral de ${department.name}`}>
              <g>{municipalities.map((feature) => {
                const highlighted = municipality !== "TODOS" && normalize(featureName(feature)) === normalize(municipality);
                return <path key={featureId(feature)} d={polygonPath(feature)} className={`stroke-[#74458E] [stroke-width:1.35] transition-colors ${highlighted ? "fill-[#B985CE]" : "fill-[#F1E5F6] hover:fill-[#DFC5EA]"}`}><title>{featureName(feature)}</title></path>;
              })}</g>
              <g>{filtered.map((place) => { const [cx, cy] = projection(place.geometry.coordinates); return <circle key={`${place.properties.municipio}-${place.properties.puesto}-${place.properties.codigo_zona}-${place.properties.codigo_puesto}`} cx={cx} cy={cy} r={selected === place ? 10 : 5.2} onClick={() => setSelected(place)} className={`cursor-pointer stroke-white [stroke-width:2] ${selected === place ? "fill-[#C99A34]" : "fill-[#5A2D82] hover:fill-[#C99A34]"}`}><title>{place.properties.puesto}</title></circle>; })}</g>
            </svg>
          )}

          {!mapLoading && !error && !department.resultsAvailable && <div className="absolute bottom-5 left-1/2 w-[min(620px,calc(100%-2rem))] -translate-x-1/2 rounded-xl border border-[#C8A5DA] bg-white/95 px-5 py-3 text-center shadow-xl backdrop-blur"><strong className="block text-[#5A2D82]">Puestos y mesas de {department.name}</strong><span className="mt-1 block text-xs leading-5 text-[#6A6071]">Los puntos, direcciones y cantidades de mesas ya están disponibles. Los resultados históricos están en procesamiento.</span></div>}

          {selected && <aside className="absolute right-4 top-4 max-h-[650px] w-[min(370px,calc(100%-2rem))] overflow-y-auto border-t-4 border-[#5A2D82] bg-white p-6 shadow-2xl">
            <button onClick={() => setSelected(null)} className="absolute right-4 top-3 h-8 w-8 rounded-full bg-[#F1ECF4] text-sm" aria-label="Cerrar">×</button>
            <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#7B3FB6]">Puesto de votación</p><h2 className="mr-8 mt-2 font-serif text-2xl font-bold leading-tight">{selected.properties.puesto}</h2><p className="mt-3 border-b border-[#E8E0EC] pb-4 text-sm text-[#6A6071]">{selected.properties.direccion}</p>
            <dl className="my-3 text-xs"><div className="flex justify-between border-b border-[#EEE8F1] py-2"><dt>Municipio</dt><dd className="font-bold">{selected.properties.municipio}</dd></div>{selected.properties.codigo_zona && <div className="flex justify-between border-b border-[#EEE8F1] py-2"><dt>Zona / puesto</dt><dd className="font-bold">{selected.properties.codigo_zona} / {selected.properties.codigo_puesto}</dd></div>}{selected.properties.mesas ? <div className="flex justify-between border-b border-[#EEE8F1] py-2"><dt>Mesas de votación</dt><dd className="font-bold">{selected.properties.mesas}</dd></div> : null}{selected.properties.comuna ? <div className="flex justify-between border-b border-[#EEE8F1] py-2"><dt>Comuna / localidad</dt><dd className="max-w-[210px] text-right font-bold">{selected.properties.comuna}</dd></div> : null}</dl>
            {department.resultsAvailable ? <>
              <div className="mt-5 flex items-end justify-between"><h3 className="font-serif font-bold">{activeElection?.label}</h3><span className="text-[10px] text-[#756A7B]">votos por puesto</span></div>
              <div className="mt-2">{resultsLoading ? <p className="py-6 text-center text-xs text-[#756A7B]">Cargando resultados…</p> : candidates.length ? candidates.map((candidate, index) => <div key={candidate.codigo} className="grid grid-cols-[24px_1fr_auto] items-center gap-2 border-b border-[#EEE8F1] py-2"><span className="grid h-6 w-6 place-items-center rounded-full bg-[#F1E7F7] text-[10px] font-bold text-[#5A2D82]">{index + 1}</span><span><strong className="block text-[11px] leading-tight">{candidate.candidato}</strong><small className="mt-1 block text-[9px] text-[#756A7B]">{candidate.partido}</small></span><b className="text-sm">{candidate.votos.toLocaleString("es-CO")}</b></div>) : <p className="py-6 text-center text-xs text-[#756A7B]">Este puesto no tiene resultados asociados para la elección seleccionada.</p>}</div>
              <p className="mt-4 text-center text-[10px] text-[#756A7B]">Resultados agregados de todas las mesas del puesto.</p>
            </> : <div className="mt-4 rounded-lg bg-[#F3E8F8] p-4 text-center text-xs leading-5 text-[#665B6D]"><strong className="block text-[#5A2D82]">Resultados históricos en preparación</strong>Ya puedes consultar la ubicación y el número de mesas de este puesto.</div>}
          </aside>}
        </section>
      </div>
    </div>
  );
}
