"use client";

import { useMemo, useState } from "react";
import Container from "@/components/ui/container";
import { newsMock } from "@/services/mock/news";
import NewsCard from "@/components/news/news-card";

const filters = [
  { label: "Todas", value: "all" },
  { label: "Colombia", value: "colombia" },
  { label: "Panamá", value: "panama" },
  { label: "Países Bajos", value: "paises-bajos" },
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
        <h1 className="text-4xl font-bold text-white">Noticias</h1>
        <p className="mt-4 text-white/65">
          Seguimiento de coyuntura, análisis político y contenido estratégico
          organizado por país.
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
                  : "border-white/10 bg-transparent text-white/70 hover:border-white/20 hover:text-white"
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
            country={news.country}
            date={news.date}
            summary={news.summary}
            image={news.image}
          />
        ))}
      </div>
    </Container>
  );
}