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
        <p className="text-sm uppercase tracking-[0.18em] text-white/45">
          {article.country} · {article.date}
        </p>

        <h1 className="mt-4 text-4xl font-bold text-white">
          {article.title}
        </h1>

        <p className="mt-6 text-lg text-white/70">
          {article.summary}
        </p>

        <div className="mt-10 overflow-hidden rounded-2xl border border-white/10">
          <img
            src={article.image}
            alt={article.title}
            className="h-[420px] w-full object-cover"
          />
        </div>

        <div className="mt-10 space-y-6 text-base leading-8 text-white/80">
          <p>{article.content}</p>
        </div>
      </article>
    </Container>
  );
}