import NewsDetailClient from "@/components/news/news-detail-client";
import { newsMock } from "@/services/mock/news";

type NewsPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return newsMock.map((news) => ({ slug: news.slug }));
}

export default async function NewsDetailPage({ params }: NewsPageProps) {
  const { slug } = await params;
  const fallback = newsMock.find((item) => item.slug === slug) || null;

  return <NewsDetailClient slug={slug} fallback={fallback} />;
}
