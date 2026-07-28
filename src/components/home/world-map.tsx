"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";

import Container from "@/components/ui/container";
import { activeMapCountries } from "@/config/map-countries";

const geographyUrl =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const activeMapCountriesById = new Map(
  activeMapCountries.map((country) => [country.geographyId, country])
);

export default function WorldMap() {
  const router = useRouter();

  const [hoveredCountryId, setHoveredCountryId] = useState<string | null>(
    null
  );

  return (
    <section className="scroll-mt-24 py-20">
      <Container>
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.2em] text-[#A970FF]">
            Presencia internacional
          </p>

          <h2 className="mt-3 text-3xl font-semibold text-white">
            Análisis político global
          </h2>

          <p className="mt-3 max-w-2xl text-white/65">
            Explora los países donde PLANdeC desarrolla análisis político,
            comunicación estratégica e inteligencia electoral.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0B1020] p-4 shadow-[0_0_40px_rgba(0,0,0,0.25)] md:p-8">
          <div className="mx-auto max-w-6xl overflow-hidden rounded-xl bg-[radial-gradient(circle_at_center,_rgba(90,45,130,0.18),_transparent_48%),linear-gradient(180deg,_#0E152B_0%,_#09101F_100%)]">
            <ComposableMap
              projectionConfig={{
                rotate: [-10, 0, 0],
                scale: 155,
              }}
              width={900}
              height={410}
              className="h-auto w-full"
            >
              <Geographies geography={geographyUrl}>
                {({ geographies }) =>
                  geographies.map((geography) => {
                    const geographyId = String(geography.id).padStart(3, "0");

                    const activeCountry =
                      activeMapCountriesById.get(geographyId);

                    const isActive = Boolean(activeCountry);

                    const isHovered =
                      Boolean(activeCountry) &&
                      hoveredCountryId === activeCountry?.geographyId;

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
                            setHoveredCountryId(
                              activeCountry.geographyId
                            );
                          }
                        }}
                        onMouseLeave={() => {
                          setHoveredCountryId(null);
                        }}
                        tabIndex={isActive ? 0 : -1}
                        role={isActive ? "link" : undefined}
                        aria-label={
                          isActive
                            ? `Abrir información política de ${activeCountry?.name}`
                            : undefined
                        }
                        onKeyDown={(event) => {
                          if (
                            activeCountry &&
                            (event.key === "Enter" ||
                              event.key === " ")
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

    transform: isHovered ? "scale(1.18)" : "scale(1)",
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

    transform: activeCountry ? "scale(1.18)" : "scale(1)",
    transformBox: "fill-box",
    transformOrigin: "center",
  },

  pressed: {
    fill: activeCountry?.color ?? "#253149",
    outline: "none",

    transform: activeCountry ? "scale(1.1)" : "scale(1)",
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
    hoveredCountryId === country.geographyId;

  return (
    <Marker
      key={country.slug}
      coordinates={country.coordinates}
    >
      <g
        onMouseEnter={() =>
          setHoveredCountryId(country.geographyId)
        }
        onMouseLeave={() =>
          setHoveredCountryId(null)
        }
        onClick={() => router.push(country.href)}
        className="cursor-pointer"
      >
        <circle
          r={isHovered ? 4 : 3}
          fill={isHovered ? "#A970FF" : country.color}
          stroke="#FFFFFF"
          strokeWidth={1.2}
          style={{
            transition:
              "r 180ms ease, fill 180ms ease",
          }}
        />

        <text
          textAnchor="middle"
          y={country.labelOffset}
          className="fill-white text-[11px] font-semibold"
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
        </div>
      </Container>
    </section>
  );
}