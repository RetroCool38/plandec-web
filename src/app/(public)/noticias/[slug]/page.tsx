import { notFound } from "next/navigation";
import Container from "@/components/ui/container";
import { newsMock } from "@/services/mock/news";

type NewsPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return newsMock.map((news) => ({
    slug: news.slug,
  }));
}

export default async function NewsDetailPage({ params }: NewsPageProps) {
  const { slug } = await params;

  const article = newsMock.find((item) => item.slug === slug);

  if (!article) {
    notFound();
  }

  return (
    <Container className="py-16">
      <article className="mx-auto max-w-4xl">
        <p className="text-sm uppercase tracking-[0.18em] text-[#7B3FB6]">
          {article.countryLabel} · {article.date}
        </p>

        <h1 className="mt-4 text-4xl font-bold text-[#251B38]">
          {article.title}
        </h1>

        <p className="mt-6 text-lg leading-8 text-[#5F5868]">
          {article.summary}
        </p>

        <div className="mt-10 rounded-2xl border border-[#D9C7E8] bg-white/80 p-6 shadow-lg shadow-[#5A2D82]/5 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7B3FB6]">Resumen editorial PLANdeC</p>
          <div className="mt-4 space-y-6 text-base leading-8 text-[#514858]"><p>{article.content}</p></div>
          <a href={article.sourceUrl} target="_blank" rel="noreferrer" className="mt-8 inline-flex rounded-full bg-[#5A2D82] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#432061]">
            Leer la fuente: {article.source}
          </a>
        </div>
      </article>
    </Container>
  );
}
