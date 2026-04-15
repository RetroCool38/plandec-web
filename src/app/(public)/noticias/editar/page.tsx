"use client";

import { useState } from "react";
import Container from "@/components/ui/container";

const countryOptions = [
  { label: "Colombia", value: "colombia" },
  { label: "Panamá", value: "panama" },
  { label: "Países Bajos", value: "paises-bajos" },
];

export default function NoticiasEditarPage() {
  const [form, setForm] = useState({
    title: "",
    slug: "",
    country: "",
    summary: "",
    content: "",
    image: "",
    status: "pending_review",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    console.log("Noticia a enviar al backend/CMS:", form);

    alert(
      "Simulación: noticia creada y enviada a revisión. Aún no se guarda realmente."
    );
  }

  return (
    <Container className="py-16">
      <div className="max-w-4xl">
        <h1 className="text-3xl font-bold text-white">Edición de noticias</h1>

        <p className="mt-3 text-white/65">
          Esta página está pensada para que el editor cree una noticia sin tocar
          código. En producción, este formulario enviará la información al
          backend o CMS.
        </p>

        <div className="mt-6 rounded-2xl border border-[#5A2D82]/30 bg-[#5A2D82]/10 p-4 text-sm text-white/75">
          Estado inicial de toda noticia creada aquí:
          <span className="ml-2 font-semibold text-[#A970FF]">
            pending_review
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-10 max-w-4xl space-y-6">
        <div>
          <label className="mb-2 block text-sm text-white/70">Título</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Título de la noticia"
            className="w-full rounded-xl border border-white/10 bg-[#0B1020] p-4 text-white outline-none focus:border-[#5A2D82]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-white/70">Slug</label>
          <input
            name="slug"
            value={form.slug}
            onChange={handleChange}
            placeholder="ej: panama-redefine-escenario-politico"
            className="w-full rounded-xl border border-white/10 bg-[#0B1020] p-4 text-white outline-none focus:border-[#5A2D82]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-white/70">País</label>
          <select
            name="country"
            value={form.country}
            onChange={handleChange}
            className="w-full rounded-xl border border-white/10 bg-[#0B1020] p-4 text-white outline-none focus:border-[#5A2D82]"
          >
            <option value="">Selecciona un país</option>
            {countryOptions.map((country) => (
              <option key={country.value} value={country.value}>
                {country.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm text-white/70">
            URL de imagen
          </label>
          <input
            name="image"
            value={form.image}
            onChange={handleChange}
            placeholder="https://..."
            className="w-full rounded-xl border border-white/10 bg-[#0B1020] p-4 text-white outline-none focus:border-[#5A2D82]"
          />

          <div className="mt-3 rounded-xl border border-white/10 bg-[#0B1020] p-4 text-sm text-white/65">
            <p className="font-medium text-white">Guía de imagen</p>
            <p className="mt-2">Tamaño recomendado: 1200 x 630 px</p>
            <p>Formato: horizontal</p>
            <p>Usar imagen limpia, nítida y optimizada para web</p>
          </div>

          {form.image && (
            <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
              <img
                src={form.image}
                alt="Vista previa"
                className="h-[260px] w-full object-cover"
              />
            </div>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm text-white/70">Resumen</label>
          <textarea
            name="summary"
            value={form.summary}
            onChange={handleChange}
            rows={3}
            placeholder="Resumen corto de la noticia"
            className="w-full rounded-xl border border-white/10 bg-[#0B1020] p-4 text-white outline-none focus:border-[#5A2D82]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-white/70">Contenido</label>
          <textarea
            name="content"
            value={form.content}
            onChange={handleChange}
            rows={10}
            placeholder="Contenido completo"
            className="w-full rounded-xl border border-white/10 bg-[#0B1020] p-4 text-white outline-none focus:border-[#5A2D82]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-white/70">
            Estado editorial
          </label>
          <input
            value="pending_review"
            disabled
            className="w-full rounded-xl border border-white/10 bg-[#11182E] p-4 text-white/60"
          />
        </div>

        <button
          type="submit"
          className="rounded-full bg-[#5A2D82] px-6 py-3 font-semibold text-white transition hover:opacity-90"
        >
          Enviar a revisión
        </button>
      </form>
    </Container>
  );
}