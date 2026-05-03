export default function Hero() {
  return (
    <section className="relative h-screen w-full flex items-center">
      
      {/* IMAGEN DE FONDO */}
      <div className="absolute inset-0">
        <img
          src="/hero.png"
          alt="Hero PLANdeC"
          className="h-full w-full object-cover"
        />
        
        {/* OVERLAY OSCURO */}
        <div className="absolute inset-0 bg-black/60" />
        
        {/* OVERLAY MORADO MARCA */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B1020]/90 via-[#0B1020]/70 to-transparent" />
      </div>

      {/* CONTENIDO */}
      <div className="relative z-10 px-6 md:px-16 max-w-4xl">

        {/* TAG SUPERIOR */}
        <p className="mb-4 text-sm uppercase tracking-[0.2em] text-[#A970FF]">
          Inteligencia política
        </p>

        {/* TITULO */}
        <h1 className="text-4xl md:text-6xl font-bold leading-tight">
          Anticipa escenarios políticos y posiciona tu liderazgo con estrategia
        </h1>

        {/* SUBTITULO */}
        <p className="mt-6 text-lg text-white/70">
          Análisis electoral, comportamiento del votante y estrategias de posicionamiento
          para campañas, gobiernos y organizaciones que buscan influir y liderar.
        </p>

        {/* LINEA DE AUTORIDAD */}
        <p className="mt-4 text-sm text-white/50">
          Plataforma de análisis político basada en datos, territorio y tendencias reales.
        </p>

        {/* BOTONES */}
        <div className="mt-8 flex gap-4">
          <button className="bg-[#5A2D82] px-6 py-3 rounded-full font-semibold hover:opacity-90 transition">
            Explorar plataforma
          </button>

          <button className="border border-white/30 px-6 py-3 rounded-full hover:bg-white/10 transition">
            Ver soluciones
          </button>
        </div>
      </div>
    </section>
  );
}