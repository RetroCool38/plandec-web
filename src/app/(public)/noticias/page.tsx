"use client";

import { useMemo, useState } from "react";
import Container from "@/components/ui/container";
import { newsMock } from "@/services/mock/news";
import NewsCard from "@/components/news/news-card";

const filters = [
  { label: "Todas", value: "all" },
  { label: "Barranquilla y Atlántico", value: "barranquilla" },
  { label: "Norte de Santander", value: "norte-de-santander" },
  { label: "Bogotá D. C.", value: "bogota" },
];

export default function NoticiasPage() {
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredNews = useMemo(() => {
    if (activeFilter === "all") return newsMock;

    return newsMock.filter((news) => news.country === activeFilter);
  }, [activeFilter]);

  return (
    <Container className="py-16">
      <div className="max-w-3xl">
        <p className="text-sm uppercase tracking-[0.2em] text-[#7B3FB6]">Actualidad territorial</p>
        <h1 className="mt-3 text-4xl font-bold text-[#251B38]">Noticias</h1>
        <p className="mt-4 text-[#625A69]">
          Hechos recientes de los territorios donde PLANdeC desarrolla
          inteligencia electoral y análisis político.
        </p>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        {filters.map((filter) => {
          const isActive = activeFilter === filter.value;

          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => setActiveFilter(filter.value)}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                isActive
                  ? "border-[#5A2D82] bg-[#5A2D82] text-white"
                  : "border-[#CDB9DC] bg-white/60 text-[#5F5868] hover:border-[#8B55B2] hover:text-[#5A2D82]"
              }`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {filteredNews.map((news) => (
          <NewsCard
            key={news.id}
            slug={news.slug}
            title={news.title}
            country={news.countryLabel}
            date={news.date}
            summary={news.summary}
            source={news.source}
          />
        ))}
      </div>
    </Container>
  );
}
