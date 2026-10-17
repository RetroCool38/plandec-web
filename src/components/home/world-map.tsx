"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import Container from "@/components/ui/container";
import { activeMapCountries, activeMapCountriesByName } from "@/config/map-countries";

const worldMap = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
const colombiaMap = "/data/departamentos_colombia.geojson";
type Feature = { rsmKey: string; properties?: Record<string, string | undefined> };
type GeoProps = { geographies: Feature[] };

const territories = [
  { code: "08", name: "Atlántico", capital: "Barranquilla", status: "Activo", color: "#F4C542", href: "/inteligencia-electoral" },
  { code: "54", name: "Norte de Santander", capital: "Cúcuta", status: "Preparación", color: "#A970FF", href: "/campana" },
  { code: "11", name: "Bogotá D. C.", capital: "Distrito Capital", status: "Preparación", color: "#E95E73", href: "/campana" },
] as const;
const territoryByCode = new Map<string, (typeof territories)[number]>(territories.map((item) => [item.code, item]));

export default function WorldMap() {
  const router = useRouter();
  const [view, setView] = useState<"world" | "colombia">("world");
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [hoveredTerritory, setHoveredTerritory] = useState<string | null>(null);
  const openCountry = (slug: string, href: string) => slug === "colombia" ? setView("colombia") : router.push(href);

  return <section className="scroll-mt-24 py-20"><Container>
    <div className="mb-8">
      <p className="text-sm uppercase tracking-[.2em] text-[#7B3FB6]">Presencia internacional</p>
      <h2 className="mt-3 text-3xl font-semibold text-[#2A2140]">Análisis político global</h2>
      <p className="mt-3 max-w-2xl text-[#5F5868]">Explora los países y territorios donde PLANdeC desarrolla inteligencia electoral.</p>
    </div>
    <div className="grid overflow-hidden rounded-3xl border border-[#D9C7E8] bg-white/80 p-3 shadow-xl shadow-[#5A2D82]/10 md:p-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-5">
      <div className="relative overflow-hidden rounded-2xl border border-[#6F4A85] bg-[radial-gradient(circle_at_47%_40%,rgba(180,126,207,.32),transparent_42%),linear-gradient(145deg,#362447_0%,#1D142C_100%)] shadow-inner">
        <div className="absolute left-5 top-5 z-10 flex items-center gap-2">
          {view === "colombia" && <button onClick={() => setView("world")} className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold text-white backdrop-blur-sm hover:bg-white/20">← Volver al mundo</button>}
          <span className="hidden rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs text-white/80 sm:block">{view === "world" ? "Selecciona un país para explorar" : "Selecciona un territorio de Colombia"}</span>
        </div>

        {view === "world" ? <ComposableMap projectionConfig={{ rotate: [-10, 0, 0], scale: 150 }} width={900} height={430} className="min-h-[430px] w-full">
          <Geographies geography={worldMap}>{({ geographies }: GeoProps) => geographies.map((geo) => {
            const country = activeMapCountriesByName.get(geo.properties?.name ?? "");
            const hovered = hoveredCountry === country?.geographyName;
            return <Geography key={geo.rsmKey} geography={geo} onClick={() => country && openCountry(country.slug, country.href)} onMouseEnter={() => country && setHoveredCountry(country.geographyName)} onMouseLeave={() => setHoveredCountry(null)} fill={country?.color ?? "#4A3C59"} stroke="#24172F" strokeWidth={.65} style={{ default: { fill: hovered ? "#A970FF" : country?.color ?? "#4A3C59", outline: "none", cursor: country ? "pointer" : "default" }, hover: { fill: country ? "#C58BE2" : "#4A3C59", outline: "none", cursor: country ? "pointer" : "default" }, pressed: { fill: country?.color ?? "#4A3C59", outline: "none" } }} />;
          })}</Geographies>
          {activeMapCountries.map((country) => <Marker key={country.slug} coordinates={country.coordinates}><g onClick={() => openCountry(country.slug, country.href)} onMouseEnter={() => setHoveredCountry(country.geographyName)} onMouseLeave={() => setHoveredCountry(null)} className="cursor-pointer"><circle r={hoveredCountry === country.geographyName ? 6 : 4.5} fill={country.color} stroke="#FFF" strokeWidth={2}/><text x={country.labelOffsetX} y={country.labelOffset} textAnchor={country.labelAnchor} className="fill-white text-[11px] font-bold" style={{ paintOrder: "stroke", stroke: "#09101F", strokeWidth: 3 }}>{country.name}</text></g></Marker>)}
        </ComposableMap> : <ComposableMap projection="geoMercator" projectionConfig={{ center: [-73.4, 4.4], scale: 1850 }} width={900} height={430} className="min-h-[430px] w-full">
          <Geographies geography={colombiaMap}>{({ geographies }: GeoProps) => geographies.map((geo) => {
            const code = geo.properties?.dpto_ccdgo ?? "";
            const territory = territoryByCode.get(code);
            const hovered = hoveredTerritory === code;
            return <Geography key={geo.rsmKey} geography={geo} onClick={() => territory && router.push(territory.href)} onMouseEnter={() => territory && setHoveredTerritory(code)} onMouseLeave={() => setHoveredTerritory(null)} fill={territory?.color ?? "#4A3C59"} stroke="#281735" strokeWidth={.7} style={{ default: { fill: hovered ? "#D9A9EF" : territory?.color ?? "#4A3C59", outline: "none", cursor: territory ? "pointer" : "default" }, hover: { fill: territory ? "#D9A9EF" : "#584667", outline: "none", cursor: territory ? "pointer" : "default" }, pressed: { fill: territory?.color ?? "#4A3C59", outline: "none" } }} />;
          })}</Geographies>
          <Marker coordinates={[-74.0721, 4.711]}><g className="pointer-events-none"><circle r={5} fill="#E95E73" stroke="#FFF" strokeWidth={2}/><text x={10} y={4} className="fill-white text-[11px] font-bold" style={{ paintOrder: "stroke", stroke: "#1D142C", strokeWidth: 3 }}>Bogotá D. C.</text></g></Marker>
          <Marker coordinates={[-74.95, 10.98]}><text x={8} className="fill-white text-[10px] font-bold" style={{ paintOrder: "stroke", stroke: "#1D142C", strokeWidth: 3 }}>Atlántico</text></Marker>
          <Marker coordinates={[-72.85, 7.9]}><text x={8} className="fill-white text-[10px] font-bold" style={{ paintOrder: "stroke", stroke: "#1D142C", strokeWidth: 3 }}>Norte de Santander</text></Marker>
        </ComposableMap>}
      </div>

      <aside className="mt-3 flex flex-col rounded-2xl bg-gradient-to-b from-[#F4EAF9] to-[#E6D3F0] p-5 lg:mt-0">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-[#7B3FB6]">{view === "world" ? "Territorios de análisis" : "Colombia · cobertura inicial"}</p>
        <h3 className="mt-2 text-2xl font-semibold leading-tight text-[#2A2140]">{view === "world" ? "Una lectura local con perspectiva internacional" : "Análisis territorial por departamento"}</h3>
        <p className="mt-3 text-sm leading-6 text-[#625A69]">{view === "world" ? "Haz clic en Colombia para conocer las zonas de trabajo." : "Selecciona un territorio para abrir su mapa electoral detallado."}</p>
        <div className="mt-5 grid gap-3">
          {view === "world" ? activeMapCountries.map((country) => <button key={country.slug} onClick={() => openCountry(country.slug, country.href)} onMouseEnter={() => setHoveredCountry(country.geographyName)} onMouseLeave={() => setHoveredCountry(null)} className="group flex items-start gap-3 rounded-xl border border-[#D8C3E4] bg-white/90 px-4 py-4 text-left transition hover:-translate-y-.5 hover:border-[#8B55B2]"><Dot color={country.color}/><span><strong className="block text-sm text-[#2A2140]">{country.name}</strong><small className="mt-1 block leading-5 text-[#6A6071]">{country.description}</small></span></button>) : territories.map((territory) => <Link key={territory.code} href={territory.href} onMouseEnter={() => setHoveredTerritory(territory.code)} onMouseLeave={() => setHoveredTerritory(null)} className="group flex items-start gap-3 rounded-xl border border-[#D8C3E4] bg-white/90 px-4 py-4 transition hover:-translate-y-.5 hover:border-[#8B55B2]"><Dot color={territory.color}/><span className="min-w-0 flex-1"><strong className="block text-sm text-[#2A2140]">{territory.name}</strong><small className="mt-1 block leading-5 text-[#6A6071]">{territory.capital}</small></span><small className="rounded-full bg-[#F1E5F6] px-2 py-1 text-[10px] font-bold text-[#633386]">{territory.status}</small></Link>)}
        </div>
        {view === "world" ? <Link href="/noticias" className="mt-auto pt-5 text-sm font-bold text-[#5A2D82]">Ver actualidad por país →</Link> : <button onClick={() => setView("world")} className="mt-auto pt-5 text-left text-sm font-bold text-[#5A2D82]">← Volver al mapa mundial</button>}
      </aside>
    </div>
  </Container></section>;
}

function Dot({ color }: { color: string }) {
  return <span className="mt-1 h-3 w-3 shrink-0 rounded-full ring-4 ring-[#F2EAF7]" style={{ backgroundColor: color }}/>;
}
