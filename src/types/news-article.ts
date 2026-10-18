export type NewsStatus = "draft" | "pending_review" | "published";

export type NewsArticle = {
  id: string | number;
  slug: string;
  title: string;
  country: string;
  countryLabel: string;
  date: string;
  summary: string;
  content: string;
  source: string;
  sourceUrl: string;
  imageUrl?: string;
  status?: NewsStatus;
  authorId?: string | null;
};

