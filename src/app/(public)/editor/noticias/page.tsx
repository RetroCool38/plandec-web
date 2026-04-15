"use client";

import { useState } from "react";
import Container from "@/components/ui/container";

export default function EditorNoticiasPage() {
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    console.log("DATA A ENVIAR (futuro API):", form);

    alert(
      "Simulación: noticia enviada a revisión. Aún no se guarda ni se publica."
    );
  }

  return (
    <Container className="py-16">
      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold text-white">Editor de Noticias</h1>

        <p className="mt-3 text-white/60">
          Esta interfaz está preparada para conectar con backend. Las noticias
          creadas aquí deben entrar con estado{" "}
          <span className="font-semibold text-[#A970FF]">pending_review</span>.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-10 max-w-3xl space-y-6">
        <div>
          <label className="mb-2 block text-sm text-white/70">Título</label>
          <input
            name="title"
            placeholder="Título de la noticia"
            value={form.title}
            onChange={handleChange}
            className="w-full rounded-lg border border-white/10 bg-[#0B1020] p-4 text-white outline-none focus:border-[#5A2D82]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-white/70">Slug</label>
          <input
            name="slug"
            placeholder="ej: panama-elecciones-2026"
            value={form.slug}
            onChange={handleChange}
            className="w-full rounded-lg border border-white/10 bg-[#0B1020] p-4 text-white outline-none focus:border-[#5A2D82]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-white/70">País</label>
          <input
            name="country"
            placeholder="ej: panama"
            value={form.country}
            onChange={handleChange}
            className="w-full rounded-lg border border-white/10 bg-[#0B1020] p-4 text-white outline-none focus:border-[#5A2D82]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-white/70">
            URL de imagen
          </label>
          <input
            name="image"
            placeholder="https://..."
            value={form.image}
            onChange={handleChange}
            className="w-full rounded-lg border border-white/10 bg-[#0B1020] p-4 text-white outline-none focus:border-[#5A2D82]"
          />
          <p className="mt-2 text-xs text-white/40">
            Recomendado: 1200 x 600 px, formato horizontal.
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm text-white/70">Resumen</label>
          <textarea
            name="summary"
            placeholder="Resumen corto"
            value={form.summary}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-lg border border-white/10 bg-[#0B1020] p-4 text-white outline-none focus:border-[#5A2D82]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-white/70">Contenido</label>
          <textarea
            name="content"
            placeholder="Contenido completo"
            value={form.content}
            onChange={handleChange}
            rows={10}
            className="w-full rounded-lg border border-white/10 bg-[#0B1020] p-4 text-white outline-none focus:border-[#5A2D82]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-white/70">
            Estado editorial
          </label>
          <input
            value="pending_review"
            disabled
            className="w-full rounded-lg border border-white/10 bg-[#11182E] p-4 text-white/60"
          />
        </div>

        <div className="rounded-xl border border-[#5A2D82]/40 bg-[#5A2D82]/10 p-4 text-sm text-white/75">
          Esta noticia no se publica automáticamente. En producción, será enviada
          al backend para revisión editorial.
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