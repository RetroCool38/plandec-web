import Container from "@/components/ui/container";
import NewsSection from "@/components/home/news-section";

export default function HomePage() {
  return (
    <Container className="py-16">
      {/* HERO */}
      <section>
        <h1 className="text-4xl font-bold text-white">
          Inteligencia política para la toma de decisiones estratégicas
        </h1>

        <p className="mt-4 text-white/70 max-w-2xl">
          Plataforma de análisis político, datos electorales, tendencias y posicionamiento estratégico.
        </p>
      </section>

      {/* MAPA (mock por ahora) */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold text-white">
          Análisis político global
        </h2>

        <div className="mt-6 h-[300px] rounded-xl border border-white/10 flex items-center justify-center text-white/40">
          Mapa interactivo (próximamente)
        </div>
      </section>

      {/* NOTICIAS */}
      <NewsSection />
    </Container>
  );
}