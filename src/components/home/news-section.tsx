import Link from "next/link";
import { newsMock } from "@/services/mock/news";
import NewsCard from "@/components/news/news-card";

export default function NewsSection() {
  return (
    <section className="mt-20">
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-[#7B3FB6]">Lectura del contexto</p>
          <h2 className="mt-3 text-3xl font-semibold text-[#2A2140]">
            Actualidad política territorial
          </h2>
          <p className="mt-3 max-w-2xl text-[#5F5868]">
            Noticias recientes de Barranquilla, Norte de Santander y Bogotá,
            resumidas y vinculadas a su fuente original.
          </p>
        </div>

        <Link
          href="/noticias"
          className="text-sm font-semibold text-[#6F3898] transition hover:text-[#2A2140]"
        >
          Ver todas
        </Link>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {newsMock.map((news) => (
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
    </section>
  );
}
