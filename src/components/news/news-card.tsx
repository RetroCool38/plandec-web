import Link from "next/link";

type NewsCardProps = {
  slug: string;
  title: string;
  country: string;
  date: string;
  summary: string;
  image: string;
};

export default function NewsCard({
  slug,
  title,
  country,
  date,
  summary,
  image,
}: NewsCardProps) {
  return (
    <Link
      href={`/noticias/${slug}`}
      className="overflow-hidden rounded-2xl border border-white/10 bg-[#0B1020] transition hover:border-white/20 hover:bg-white/[0.03]"
    >
      <div className="h-48 w-full overflow-hidden">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="p-6">
        <p className="text-xs uppercase tracking-[0.18em] text-white/45">
          {country} · {date}
        </p>

        <h3 className="mt-3 text-lg font-semibold text-white">
          {title}
        </h3>

        <p className="mt-3 text-sm leading-6 text-white/65">
          {summary}
        </p>
      </div>
    </Link>
  );
}