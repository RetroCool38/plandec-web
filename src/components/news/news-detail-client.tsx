"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Container from "@/components/ui/container";
import { getPublishedNewsBySlug } from "@/services/news/news-client";
import type { NewsArticle } from "@/types/news-article";

type NewsDetailClientProps = {
  slug: string;
  fallback: NewsArticle | null;
};

export default function NewsDetailClient({ slug, fallback }: NewsDetailClientProps) {
  const [article, setArticle] = useState<NewsArticle | null>(fallback);
  const [loading, setLoading] = useState(!fallback);

  useEffect(() => {
    let active = true;

    getPublishedNewsBySlug(slug)
      .then((news) => {
        if (active && news) setArticle(news);
      })
      .catch(() => {
        // The bundled article remains visible when the content service is offline.
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <Container className="py-20">
        <p className="text-center text-[#625A69]">Cargando noticia…</p>
      </Container>
    );
  }

  if (!article) {
    return (
      <Container className="py-20 text-center">
        <h1 className="text-3xl font-bold text-[#251B38]">Noticia no encontrada</h1>
        <Link href="/noticias" className="mt-6 inline-flex rounded-full bg-[#5A2D82] px-5 py-3 font-semibold text-white">
          Volver a noticias
        </Link>
      </Container>
    );
  }

  return (
    <Container className="py-16">
      <article className="mx-auto max-w-4xl">
        <p className="text-sm uppercase tracking-[0.18em] text-[#7B3FB6]">
          {article.countryLabel} · {article.date}
        </p>

        <h1 className="mt-4 text-4xl font-bold text-[#251B38]">{article.title}</h1>
        <p className="mt-6 text-lg leading-8 text-[#5F5868]">{article.summary}</p>

        {article.imageUrl && (
          <img
            src={article.imageUrl}
            alt=""
            className="mt-8 max-h-[480px] w-full rounded-2xl object-cover"
          />
        )}

        <div className="mt-10 rounded-2xl border border-[#D9C7E8] bg-white/80 p-6 shadow-lg shadow-[#5A2D82]/5 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7B3FB6]">Resumen editorial PLANdeC</p>
          <div className="mt-4 whitespace-pre-line text-base leading-8 text-[#514858]">{article.content}</div>
          <a href={article.sourceUrl} target="_blank" rel="noreferrer" className="mt-8 inline-flex rounded-full bg-[#5A2D82] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#432061]">
            Leer la fuente: {article.source}
          </a>
        </div>
      </article>
    </Container>
  );
}
