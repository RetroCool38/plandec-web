"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";

import Container from "@/components/ui/container";
import {
  activeMapCountries,
  activeMapCountriesByName,
} from "@/config/map-countries";

const geographyUrl =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

type GeographyFeature = {
  rsmKey: string;
  id?: string | number;
  properties?: {
    name?: string;
  };
};

type GeographiesRenderProps = {
  geographies: GeographyFeature[];
};

export default function WorldMap() {
  const router = useRouter();

  const [hoveredCountryName, setHoveredCountryName] = useState<string | null>(
    null
  );

  return (
    <section className="scroll-mt-24 py-20">
      <Container>
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.2em] text-[#7B3FB6]">
            Presencia internacional
          </p>

          <h2 className="mt-3 text-3xl font-semibold text-[#2A2140]">
            Análisis político global
          </h2>

          <p className="mt-3 max-w-2xl text-[#5F5868]">
            Explora los países donde PLANdeC desarrolla análisis político,
            comunicación estratégica e inteligencia electoral.
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-[#D9C7E8] bg-white/75 p-3 shadow-xl shadow-[#5A2D82]/10 backdrop-blur-sm md:p-6">
          <div className="mx-auto max-w-6xl overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_47%_40%,_rgba(116,72,157,0.25),_transparent_42%),linear-gradient(180deg,_#131B34_0%,_#09101F_100%)]">
            <ComposableMap
              projectionConfig={{
                rotate: [-10, 0, 0],
                scale: 150,
              }}
              width={900}
              height={350}
              className="h-auto w-full"
            >
              <Geographies geography={geographyUrl}>
               {({ geographies }: GeographiesRenderProps) =>
                  geographies.map((geography) => {
                    const geographyName =
                      geography.properties?.name ?? "";

                    const activeCountry =
                      activeMapCountriesByName.get(geographyName);

                    const isActive = Boolean(activeCountry);

                    const isHovered =
                      Boolean(activeCountry) &&
                      hoveredCountryName === activeCountry?.geographyName;

                    return (
                      <Geography
                        key={geography.rsmKey}
                        geography={geography}
                        onClick={() => {
                          if (activeCountry) {
                            router.push(activeCountry.href);
                          }
                        }}
                        onMouseEnter={() => {
                          if (activeCountry) {
                            setHoveredCountryName(
                              activeCountry.geographyName
                            );
                          }
                        }}
                        onMouseLeave={() => {
                          setHoveredCountryName(null);
                        }}
                        tabIndex={isActive ? 0 : -1}
                        role={isActive ? "link" : undefined}
                        aria-label={
                          isActive
                            ? `Abrir información política de ${activeCountry?.name}`
                            : undefined
                        }
                        onKeyDown={(event: React.KeyboardEvent<SVGPathElement>) => {
                          if (
                            activeCountry &&
                            (event.key === "Enter" || event.key === " ")
                          ) {
                            event.preventDefault();
                            router.push(activeCountry.href);
                          }
                        }}
                        fill={activeCountry?.color ?? "#253149"}
                        stroke="#0B1020"
                        strokeWidth={0.65}
                        style={{
                          default: {
                            fill: isHovered
                              ? "#A970FF"
                              : activeCountry?.color ?? "#253149",
                            outline: "none",
                            cursor: isActive ? "pointer" : "default",
                            filter: isHovered
                              ? "drop-shadow(0 0 10px rgba(169, 112, 255, 0.95))"
                              : "none",
                            transform: isHovered
                              ? "scale(1.18)"
                              : "scale(1)",
                            transformBox: "fill-box",
                            transformOrigin: "center",
                            transition:
                              "fill 180ms ease, filter 180ms ease, transform 180ms ease",
                          },
                          hover: {
                            fill: activeCountry ? "#A970FF" : "#253149",
                            outline: "none",
                            cursor: isActive ? "pointer" : "default",
                            filter: activeCountry
                              ? "drop-shadow(0 0 10px rgba(169, 112, 255, 0.95))"
                              : "none",
                            transform: activeCountry
                              ? "scale(1.18)"
                              : "scale(1)",
                            transformBox: "fill-box",
                            transformOrigin: "center",
                          },
                          pressed: {
                            fill: activeCountry?.color ?? "#253149",
                            outline: "none",
                            transform: activeCountry
                              ? "scale(1.1)"
                              : "scale(1)",
                            transformBox: "fill-box",
                            transformOrigin: "center",
                          },
                        }}
                      />
                    );
                  })
                }
              </Geographies>

              {activeMapCountries.map((country) => {
                const isHovered =
                  hoveredCountryName === country.geographyName;

                return (
                  <Marker
                    key={country.slug}
                    coordinates={country.coordinates}
                  >
                    <g
                      onMouseEnter={() =>
                        setHoveredCountryName(country.geographyName)
                      }
                      onMouseLeave={() => setHoveredCountryName(null)}
                      onClick={() => router.push(country.href)}
                      className="cursor-pointer"
                    >
                      <circle
                        r={isHovered ? 6 : 4.5}
                        fill={isHovered ? "#A970FF" : country.color}
                        stroke="#FFFFFF"
                        strokeWidth={2}
                        style={{
                          transition: "r 180ms ease, fill 180ms ease",
                        }}
                      />

                      <text
                        textAnchor="middle"
                        y={country.labelOffset}
                        x={country.labelOffsetX}
                        className="fill-white text-[10px] font-semibold md:text-[11px]"
                        style={{
                          paintOrder: "stroke",
                          stroke: "#09101F",
                          strokeWidth: 3,
                          strokeLinejoin: "round",
                          transform: isHovered
                            ? "scale(1.08)"
                            : "scale(1)",
                          transformBox: "fill-box",
                          transformOrigin: "center",
                          transition: "transform 180ms ease",
                        }}
                      >
                        {country.name}
                      </text>
                    </g>
                  </Marker>
                );
              })}
            </ComposableMap>
          </div>

          <div className="grid gap-3 p-2 pt-5 md:grid-cols-3 md:p-0 md:pt-5">
            {activeMapCountries.map((country) => (
              <Link
                key={country.slug}
                href={country.href}
                onMouseEnter={() => setHoveredCountryName(country.geographyName)}
                onMouseLeave={() => setHoveredCountryName(null)}
                className="group flex items-start gap-3 rounded-xl border border-[#E4D7EC] bg-white px-4 py-4 transition hover:-translate-y-0.5 hover:border-[#9D6CC5] hover:shadow-md"
              >
                <span className="mt-1 h-3 w-3 shrink-0 rounded-full ring-4 ring-[#F2EAF7]" style={{ backgroundColor: country.color }} />
                <span>
                  <strong className="block text-sm text-[#2A2140] group-hover:text-[#5A2D82]">{country.name}</strong>
                  <small className="mt-1 block leading-5 text-[#6A6071]">{country.description}</small>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
