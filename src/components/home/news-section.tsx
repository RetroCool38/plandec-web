import Link from "next/link";
import { newsMock } from "@/services/mock/news";
import NewsCard from "@/components/news/news-card";

export default function NewsSection() {
  return (
    <section className="mt-20">
      <div className="flex items-end justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Noticias estratégicas
          </h2>
          <p className="mt-3 max-w-2xl text-white/65">
            Coyuntura, análisis y lectura política preparados para evolucionar
            hacia contenido editorial conectado a CMS.
          </p>
        </div>

        <Link
          href="/noticias"
          className="text-sm font-medium text-[#A970FF] transition hover:text-white"
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
            country={news.country}
            date={news.date}
            summary={news.summary}
            image={news.image}
          />
        ))}
      </div>
    </section>
  );
}