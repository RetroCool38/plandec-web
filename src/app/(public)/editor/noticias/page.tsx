"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Container from "@/components/ui/container";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { NewsStatus } from "@/types/news-article";

type EditorRow = {
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
  status: NewsStatus;
};

const territories = [
  { value: "barranquilla", label: "Barranquilla y Atlántico" },
  { value: "norte-de-santander", label: "Norte de Santander" },
  { value: "bogota", label: "Bogotá D. C." },
  { value: "cundinamarca", label: "Cundinamarca" },
];

const emptyForm = {
  id: "",
  title: "",
  slug: "",
  territory: "barranquilla",
  publishedAt: new Date().toISOString().slice(0, 10),
  summary: "",
  content: "",
  sourceName: "",
  sourceUrl: "",
  imageUrl: "",
  status: "draft" as NewsStatus,
};

const slugify = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default function EditorNoticiasPage() {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [articles, setArticles] = useState<EditorRow[]>([]);
  const [role, setRole] = useState<"editor" | "admin" | "">("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadArticles = useCallback(async () => {
    const supabase = createClient();
    if (!supabase) return;
    const { data, error: queryError } = await supabase.from("news").select("*").order("updated_at", { ascending: false });
    if (queryError) setError(queryError.message);
    else setArticles((data || []) as EditorRow[]);
  }, []);

  useEffect(() => {
    async function initialize() {
      const supabase = createClient();
      if (!supabase) {
        setLoading(false);
        return;
      }
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        router.replace("/login");
        return;
      }
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", authData.user.id).maybeSingle();
      if (!profile || !["editor", "admin"].includes(profile.role)) {
        await supabase.auth.signOut();
        router.replace("/login");
        return;
      }
      setUserId(authData.user.id);
      setRole(profile.role as "editor" | "admin");
      await loadArticles();
      setLoading(false);
    }
    initialize();
  }, [loadArticles, router]);

  function selectArticle(article: EditorRow) {
    setForm({
      id: article.id,
      title: article.title,
      slug: article.slug,
      territory: article.territory,
      publishedAt: article.published_at || new Date().toISOString().slice(0, 10),
      summary: article.summary,
      content: article.content,
      sourceName: article.source_name,
      sourceUrl: article.source_url,
      imageUrl: article.image_url || "",
      status: article.status,
    });
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const supabase = createClient();
    if (!supabase || !userId) return;
    setSaving(true);
    setError("");
    setMessage("");
    const territoryLabel = territories.find((item) => item.value === form.territory)?.label || form.territory;
    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      territory: form.territory,
      territory_label: territoryLabel,
      published_at: form.status === "published" ? form.publishedAt : null,
      summary: form.summary.trim(),
      content: form.content.trim(),
      source_name: form.sourceName.trim(),
      source_url: form.sourceUrl.trim(),
      image_url: form.imageUrl.trim() || null,
      status: form.status,
      updated_by: userId,
    };

    const result = form.id
      ? await supabase.from("news").update(payload).eq("id", form.id)
      : await supabase.from("news").insert({ ...payload, author_id: userId });

    if (result.error) setError(result.error.message);
    else {
      setMessage(form.status === "published" ? "Noticia publicada correctamente." : "Noticia guardada correctamente.");
      setForm(emptyForm);
      await loadArticles();
    }
    setSaving(false);
  }

  async function deleteArticle() {
    if (!form.id || role !== "admin" || !window.confirm("¿Eliminar definitivamente esta noticia?")) return;
    const supabase = createClient();
    if (!supabase) return;
    const { error: deleteError } = await supabase.from("news").delete().eq("id", form.id);
    if (deleteError) setError(deleteError.message);
    else {
      setForm(emptyForm);
      setMessage("Noticia eliminada.");
      await loadArticles();
    }
  }

  async function signOut() {
    const supabase = createClient();
    await supabase?.auth.signOut();
    router.replace("/login");
  }

  if (!isSupabaseConfigured) return <Container className="py-16"><div className="rounded-2xl border border-amber-300 bg-amber-50 p-8"><h1 className="text-2xl font-bold">Editor preparado</h1><p className="mt-3 text-amber-900">Falta conectar las variables de Supabase para activar el acceso y el guardado.</p></div></Container>;
  if (loading) return <Container className="py-20 text-center text-[#6A6071]">Verificando acceso…</Container>;

  return (
    <Container className="py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-xs font-bold uppercase tracking-[.2em] text-[#7B3FB6]">Aplicación privada</p><h1 className="mt-2 font-serif text-4xl font-bold">Editor de noticias</h1><p className="mt-3 text-[#6A6071]">Crea borradores, envía a revisión y publica en la página de PLANdeC.</p></div>
        <div className="flex gap-3"><Link href="/noticias" className="rounded-xl border border-[#5A2D82] px-4 py-2 text-sm font-bold text-[#5A2D82]">Ver noticias</Link><button onClick={signOut} className="rounded-xl bg-[#291837] px-4 py-2 text-sm font-bold text-white">Cerrar sesión</button></div>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.25fr_.75fr]">
        <form onSubmit={handleSubmit} className="space-y-5 rounded-3xl border border-[#D9C7E8] bg-white p-6 shadow-lg md:p-8">
          <div className="flex items-center justify-between"><h2 className="text-xl font-bold">{form.id ? "Editar noticia" : "Nueva noticia"}</h2>{form.id && <button type="button" onClick={() => setForm(emptyForm)} className="text-sm font-bold text-[#5A2D82]">Crear nueva</button>}</div>
          <label className="block text-sm font-bold">Título<input required minLength={8} maxLength={180} value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value, slug: current.id ? current.slug : slugify(event.target.value) }))} className="mt-2 h-12 w-full rounded-xl border border-[#D8C8E0] px-4 font-normal outline-none focus:border-[#5A2D82]" /></label>
          <label className="block text-sm font-bold">URL interna<input required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" value={form.slug} onChange={(event) => setForm((current) => ({ ...current, slug: slugify(event.target.value) }))} className="mt-2 h-12 w-full rounded-xl border border-[#D8C8E0] px-4 font-normal outline-none focus:border-[#5A2D82]" /></label>
          <div className="grid gap-4 md:grid-cols-2"><label className="block text-sm font-bold">Territorio<select value={form.territory} onChange={(event) => setForm((current) => ({ ...current, territory: event.target.value }))} className="mt-2 h-12 w-full rounded-xl border border-[#D8C8E0] bg-white px-4 font-normal">{territories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label><label className="block text-sm font-bold">Estado<select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as NewsStatus }))} className="mt-2 h-12 w-full rounded-xl border border-[#D8C8E0] bg-white px-4 font-normal"><option value="draft">Borrador</option><option value="pending_review">Pendiente de revisión</option><option value="published">Publicada</option></select></label></div>
          {form.status === "published" && <label className="block text-sm font-bold">Fecha de publicación<input required type="date" value={form.publishedAt} onChange={(event) => setForm((current) => ({ ...current, publishedAt: event.target.value }))} className="mt-2 h-12 w-full rounded-xl border border-[#D8C8E0] px-4 font-normal" /></label>}
          <label className="block text-sm font-bold">Resumen<textarea required minLength={20} maxLength={500} rows={3} value={form.summary} onChange={(event) => setForm((current) => ({ ...current, summary: event.target.value }))} className="mt-2 w-full rounded-xl border border-[#D8C8E0] p-4 font-normal outline-none focus:border-[#5A2D82]" /></label>
          <label className="block text-sm font-bold">Contenido<textarea required minLength={40} maxLength={12000} rows={9} value={form.content} onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))} className="mt-2 w-full rounded-xl border border-[#D8C8E0] p-4 font-normal outline-none focus:border-[#5A2D82]" /></label>
          <div className="grid gap-4 md:grid-cols-2"><label className="block text-sm font-bold">Nombre de la fuente<input required value={form.sourceName} onChange={(event) => setForm((current) => ({ ...current, sourceName: event.target.value }))} className="mt-2 h-12 w-full rounded-xl border border-[#D8C8E0] px-4 font-normal" /></label><label className="block text-sm font-bold">Enlace de la fuente<input required type="url" value={form.sourceUrl} onChange={(event) => setForm((current) => ({ ...current, sourceUrl: event.target.value }))} className="mt-2 h-12 w-full rounded-xl border border-[#D8C8E0] px-4 font-normal" /></label></div>
          <label className="block text-sm font-bold">Imagen (opcional)<input type="url" value={form.imageUrl} onChange={(event) => setForm((current) => ({ ...current, imageUrl: event.target.value }))} placeholder="https://..." className="mt-2 h-12 w-full rounded-xl border border-[#D8C8E0] px-4 font-normal" /></label>
          {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}{message && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>}
          <div className="flex flex-wrap gap-3"><button disabled={saving} className="rounded-xl bg-[#5A2D82] px-6 py-3 font-bold text-white disabled:opacity-60">{saving ? "Guardando…" : form.status === "published" ? "Guardar y publicar" : "Guardar noticia"}</button>{form.id && role === "admin" && <button type="button" onClick={deleteArticle} className="rounded-xl border border-red-300 px-5 py-3 font-bold text-red-700">Eliminar</button>}</div>
        </form>

        <aside className="rounded-3xl border border-[#D9C7E8] bg-[#F7F1FA] p-5"><div className="flex items-center justify-between"><h2 className="font-serif text-xl font-bold">Noticias guardadas</h2><span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#5A2D82]">{articles.length}</span></div><div className="mt-4 space-y-3">{articles.map((article) => <button type="button" key={article.id} onClick={() => selectArticle(article)} className="w-full rounded-2xl border border-[#E3D6EA] bg-white p-4 text-left transition hover:border-[#8B55B2]"><span className={`text-[10px] font-bold uppercase tracking-wider ${article.status === "published" ? "text-emerald-700" : "text-amber-700"}`}>{article.status === "published" ? "Publicada" : article.status === "pending_review" ? "En revisión" : "Borrador"}</span><strong className="mt-2 block text-sm leading-5">{article.title}</strong><small className="mt-2 block text-[#756A7B]">{article.territory_label}</small></button>)}{!articles.length && <p className="rounded-xl bg-white p-5 text-center text-sm text-[#756A7B]">Aún no hay noticias guardadas.</p>}</div></aside>
      </div>
    </Container>
  );
}
