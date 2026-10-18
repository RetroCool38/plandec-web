import type { NewsArticle } from "@/types/news-article";
import { createClient } from "@/lib/supabase/client";

type NewsRow = {
  id: string;
  slug: string;
  title: string;
  territory: string;
  territory_label: string;
  published_at: string | null;
  summary: string;
  content: string;
  source_name: string;
  source_url: string;
  image_url: string | null;
  status: NewsArticle["status"];
  author_id: string | null;
};

export function rowToArticle(row: NewsRow): NewsArticle {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    country: row.territory,
    countryLabel: row.territory_label,
    date: row.published_at || new Date().toISOString().slice(0, 10),
    summary: row.summary,
    content: row.content,
    source: row.source_name,
    sourceUrl: row.source_url,
    imageUrl: row.image_url || undefined,
    status: row.status,
    authorId: row.author_id,
  };
}

export async function getPublishedNews(): Promise<NewsArticle[] | null> {
  const supabase = createClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("news")
    .select("id,slug,title,territory,territory_label,published_at,summary,content,source_name,source_url,image_url,status,author_id")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) throw error;
  return (data as NewsRow[]).map(rowToArticle);
}

export async function getPublishedNewsBySlug(slug: string): Promise<NewsArticle | null> {
  const supabase = createClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("news")
    .select("id,slug,title,territory,territory_label,published_at,summary,content,source_name,source_url,image_url,status,author_id")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) throw error;
  return data ? rowToArticle(data as NewsRow) : null;
}

