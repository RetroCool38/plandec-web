import Container from "@/components/ui/container";
import { getNews } from "@/services/notion/news-service";

export default async function NewsSection() {
  const news = await getNews();

  return (
    <section className="py-20">
      <Container>
        <div>
          <h2 className="text-2xl font-semibold">Noticias y análisis recientes</h2>
          <p className="mt-3 max-w-2xl text-white/65">
            Información estratégica, coyuntura y lectura política en tiempo real.
          </p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {news.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-white/10 bg-[#0B1020] p-6 transition hover:border-white/20 hover:translate-y-[-2px]"
            >
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="mt-3 text-sm text-white/65">{item.excerpt}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}