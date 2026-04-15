<div className="rounded-2xl border border-white/10 bg-[#0B1020] p-8">
  <h2 className="text-2xl font-semibold text-white">
    Solicitar asesoría
  </h2>

  <p className="mt-4 text-white/70">
    Déjanos tus datos y te contactaremos para construir una estrategia
    adaptada a tu contexto político o institucional.
  </p>

  {/* FORMULARIO */}
  <div className="mt-8 space-y-4">

    <input
      type="text"
      placeholder="Nombre completo"
      className="w-full rounded-xl border border-white/10 bg-[#08101F] px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-[#5A2D82]"
    />

    <input
      type="tel"
      placeholder="Número de teléfono"
      className="w-full rounded-xl border border-white/10 bg-[#08101F] px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-[#5A2D82]"
    />

    <input
      type="email"
      placeholder="Correo electrónico"
      className="w-full rounded-xl border border-white/10 bg-[#08101F] px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-[#5A2D82]"
    />

    <textarea
      placeholder="Cuéntanos qué necesitas: campaña, posicionamiento, análisis, asesoría estratégica..."
      rows={4}
      className="w-full rounded-xl border border-white/10 bg-[#08101F] px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-[#5A2D82]"
    />

    <button className="w-full rounded-full bg-[#5A2D82] py-3 font-semibold text-white transition hover:opacity-90">
      Enviar solicitud
    </button>

  </div>
</div>