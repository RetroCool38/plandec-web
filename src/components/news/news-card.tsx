import Link from "next/link";

type NewsCardProps = { slug: string; title: string; country: string; date: string; summary: string; source: string };

export default function NewsCard({ slug, title, country, date, summary, source }: NewsCardProps) {
  const formattedDate = new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(date));
  return (
    <Link href={`/noticias/${slug}`} className="group flex min-h-[330px] flex-col overflow-hidden rounded-2xl border border-[#D9C7E8] bg-white/80 shadow-lg shadow-[#5A2D82]/5 transition hover:-translate-y-1 hover:border-[#9D6CC5] hover:shadow-xl">
      <div className="h-2 bg-gradient-to-r from-[#5A2D82] via-[#9D6CC5] to-[#D7B45A]" />
      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#713A99]">
          <span>{country}</span><span aria-hidden="true">•</span><time dateTime={date}>{formattedDate}</time>
        </div>
        <h3 className="mt-4 text-xl font-semibold leading-snug text-[#251B38] transition group-hover:text-[#5A2D82]">{title}</h3>
        <p className="mt-4 text-sm leading-6 text-[#625A69]">{summary}</p>
        <div className="mt-auto border-t border-[#EEE5F3] pt-5 text-xs text-[#756A7B]">Fuente: <span className="font-semibold text-[#4F4657]">{source}</span></div>
      </div>
    </Link>
  );
}
