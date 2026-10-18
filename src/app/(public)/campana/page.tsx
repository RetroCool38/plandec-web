"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Territory = { id: string; name: string; slug: string; status: string };
type Campaign = { id: string; name: string; status: string; territories: Territory[] };
type Contact = { id: string; full_name: string; municipality: string; polling_place: string; polling_table: string; leader_name: string; support_level: string; followup_status: string; created_at: string; territory_id: string };
type Tab = "resumen" | "registro" | "contactos" | "territorio";

const supportLabels: Record<string, string> = { interested: "Interesado", likely: "Probable", confirmed: "Confirmado", undecided: "Indeciso" };
const followupLabels: Record<string, string> = { pending: "Pendiente", contacted: "Contactado", confirmed: "Confirmado", self_reported_voted: "Reportó participación", inactive: "Inactivo" };
const emptyForm = { territory_id: "", municipality: "", full_name: "", document_number: "", phone: "", email: "", polling_place: "", polling_table: "", leader_name: "", prior_vote_choice: "", support_level: "interested", notes: "", consent: false };
const control = "mt-2 h-12 w-full rounded-xl border border-[#D7C7DE] bg-[#FCFAFD] px-4 text-sm font-normal outline-none focus:border-[#713B91] focus:ring-2 focus:ring-[#713B91]/10";
const label = "text-xs font-bold text-[#46394E]";

export default function CampaignAppPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [role, setRole] = useState("");
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("resumen");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm);

  const loadContacts = useCallback(async (campaignId: string) => {
    const supabase = createClient();
    if (!supabase) return;
    const { data } = await supabase.from("voter_contacts").select("id,full_name,municipality,polling_place,polling_table,leader_name,support_level,followup_status,created_at,territory_id").eq("campaign_id", campaignId).order("created_at", { ascending: false }).limit(250);
    setContacts((data || []) as Contact[]);
  }, []);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      if (!supabase) { setError("La conexión segura no está disponible."); setLoading(false); return; }
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;
      if (!user) { router.replace("/login"); return; }
      setUserId(user.id); setUserEmail(user.email || "");
      const [{ data: profile }, { data: campaignData, error: campaignError }] = await Promise.all([
        supabase.from("profiles").select("role").eq("id", user.id).maybeSingle(),
        supabase.from("campaigns").select("id,name,status,campaign_territories(status,territories(id,name,slug,territory_type))").limit(1).maybeSingle(),
      ]);
      setRole(profile?.role || "viewer");
      if (campaignError || !campaignData) { setError("La estructura de campañas aún no está activada en la base de datos."); setLoading(false); return; }
      const raw = campaignData as unknown as { id: string; name: string; status: string; campaign_territories: Array<{ status: string; territories: Territory | Territory[] }> };
      const territories = (raw.campaign_territories || []).flatMap((item) => (Array.isArray(item.territories) ? item.territories : [item.territories]).filter(Boolean).map((territory) => ({ ...territory, status: item.status })));
      const parsed = { id: raw.id, name: raw.name, status: raw.status, territories };
      setCampaign(parsed); setForm((current) => ({ ...current, territory_id: territories[0]?.id || "" }));
      await loadContacts(parsed.id); setLoading(false);
    }
    load();
  }, [loadContacts, router]);

  const territoryTotals = useMemo(() => campaign?.territories.map((territory) => ({ ...territory, total: contacts.filter((contact) => contact.territory_id === territory.id).length })) || [], [campaign, contacts]);
  const confirmed = contacts.filter((contact) => contact.support_level === "confirmed").length;
  const followed = contacts.filter((contact) => contact.followup_status !== "pending").length;
  const places = new Set(contacts.map((contact) => `${contact.municipality}|${contact.polling_place}`)).size;

  async function saveContact(event: FormEvent) {
    event.preventDefault(); setError(""); setMessage("");
    if (!campaign || !userId || !form.consent) { setError("Debes confirmar la autorización para guardar el registro."); return; }
    const supabase = createClient(); if (!supabase) return; setSaving(true);
    const { error: insertError } = await supabase.from("voter_contacts").insert({
      campaign_id: campaign.id, territory_id: form.territory_id, leader_name: form.leader_name.trim(), full_name: form.full_name.trim(), document_number: form.document_number.replace(/\D/g, ""),
      phone: form.phone.trim() || null, email: form.email.trim() || null, municipality: form.municipality.trim(), polling_place: form.polling_place.trim(), polling_table: form.polling_table.trim(),
      prior_vote_choice: form.prior_vote_choice || null, support_level: form.support_level, consent_at: new Date().toISOString(), notes: form.notes.trim() || null, created_by: userId,
    });
    setSaving(false);
    if (insertError) { setError(insertError.code === "23505" ? "Esta cédula ya está registrada en la campaña." : "No fue posible guardar. Revisa los campos y permisos."); return; }
    setMessage("Registro guardado en la base segura de la campaña."); setForm({ ...emptyForm, territory_id: form.territory_id }); await loadContacts(campaign.id); setActiveTab("resumen");
  }

  async function signOut() { const supabase = createClient(); await supabase?.auth.signOut(); router.replace("/login"); router.refresh(); }

  if (loading) return <main className="grid min-h-[70vh] place-items-center bg-[#EEE3F3]"><div className="text-center"><div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#D8C1E4] border-t-[#5A2D82]"/><p className="mt-4 font-bold text-[#5A2D82]">Abriendo campaña segura…</p></div></main>;
  if (error && !campaign) return <main className="grid min-h-[70vh] place-items-center bg-[#EEE3F3] px-5"><div className="max-w-xl rounded-3xl border border-[#D8C1E4] bg-white p-8 text-center shadow-xl"><h1 className="font-serif text-3xl font-bold">Aplicación en preparación</h1><p className="mt-4 text-[#6A6071]">{error}</p><Link href="/" className="mt-6 inline-block rounded-full bg-[#5A2D82] px-6 py-3 font-bold text-white">Volver al inicio</Link></div></main>;

  const tabs: Array<[Tab,string,string]> = [["resumen","Resumen","◫"],["registro","Nuevo registro","＋"],["contactos","Contactos","☷"],["territorio","Territorio","⌖"]];
  return <div className="min-h-screen bg-[#EEE3F3] text-[#281D34]">
    <header className="bg-[#271735] px-5 py-7 text-white lg:px-10"><div className="mx-auto flex max-w-[1450px] flex-wrap items-center justify-between gap-5"><div><p className="text-xs font-bold uppercase tracking-[.22em] text-[#D4AFE5]">Aplicación privada</p><h1 className="mt-2 font-serif text-3xl font-bold md:text-4xl">{campaign?.name}</h1><p className="mt-2 text-sm text-white/65">Gestión territorial, seguimiento y análisis agregado</p></div><div className="flex items-center gap-3"><div className="text-right text-xs"><b className="block">{userEmail}</b><span className="text-white/60">{role === "admin" ? "Administrador" : role}</span></div><button onClick={signOut} className="rounded-full border border-white/25 px-4 py-2 text-xs font-bold hover:bg-white/10">Salir</button></div></div></header>
    <main className="mx-auto max-w-[1450px] px-5 py-7 lg:px-10">
      <nav className="grid grid-cols-2 gap-2 rounded-2xl border border-[#D9C5E3] bg-white p-2 shadow-sm md:grid-cols-4">{tabs.map(([key,text,icon]) => <button key={key} onClick={() => setActiveTab(key)} className={`rounded-xl px-4 py-3 text-sm font-bold transition ${activeTab === key ? "bg-[#5A2D82] text-white shadow-md" : "text-[#64586B] hover:bg-[#F4ECF7]"}`}><span className="mr-2">{icon}</span>{text}</button>)}</nav>

      {activeTab === "resumen" && <><section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[["Registros autorizados",contacts.length,"Personas en esta campaña"],["Apoyos confirmados",confirmed,"Declaración voluntaria"],["Puestos cubiertos",places,"Municipio y puesto"],["Con seguimiento",followed,`${contacts.length ? Math.round(followed / contacts.length * 100) : 0}% de la base`]].map(([title,value,note]) => <article key={String(title)} className="rounded-2xl border border-[#D9C5E3] bg-white p-5 shadow-sm"><p className="text-xs font-bold uppercase tracking-[.13em] text-[#766B7B]">{title}</p><strong className="mt-3 block text-4xl text-[#5A2D82]">{value}</strong><span className="mt-2 block text-xs text-[#817486]">{note}</span></article>)}</section>
        <section className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_.95fr]"><article className="rounded-3xl border border-[#D6C0E0] bg-white p-6"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.17em] text-[#7B3FB6]">Cobertura</p><h2 className="mt-2 font-serif text-2xl font-bold">Fuerza por territorio</h2></div><button onClick={() => setActiveTab("territorio")} className="text-sm font-bold text-[#5A2D82]">Ver detalle →</button></div><div className="mt-6 space-y-5">{territoryTotals.map((territory) => { const max = Math.max(1,...territoryTotals.map((item) => item.total)); return <div key={territory.id}><div className="mb-2 flex justify-between text-sm"><b>{territory.name}</b><span>{territory.total} registros</span></div><div className="h-3 overflow-hidden rounded-full bg-[#EEE5F1]"><div className="h-full rounded-full bg-gradient-to-r from-[#5A2D82] to-[#B476C6]" style={{width:`${Math.max(territory.total ? 8 : 0, territory.total/max*100)}%`}}/></div></div>; })}</div></article>
        <article className="rounded-3xl border border-[#D6C0E0] bg-white p-6"><p className="text-xs font-bold uppercase tracking-[.17em] text-[#7B3FB6]">Actividad reciente</p><h2 className="mt-2 font-serif text-2xl font-bold">Últimos registros</h2><div className="mt-5 divide-y divide-[#ECE4F0]">{contacts.slice(0,5).map((contact) => <div key={contact.id} className="flex items-center justify-between gap-3 py-3"><div><b className="block text-sm">{contact.full_name}</b><span className="text-xs text-[#766B7B]">{contact.municipality} · Mesa {contact.polling_table}</span></div><span className="rounded-full bg-[#F1E7F6] px-3 py-1 text-[10px] font-bold text-[#5A2D82]">{supportLabels[contact.support_level]}</span></div>)}{!contacts.length && <p className="py-8 text-center text-sm text-[#766B7B]">Aún no hay registros.</p>}</div><button onClick={() => setActiveTab("registro")} className="mt-5 w-full rounded-xl bg-[#5A2D82] py-3 font-bold text-white">Registrar una persona</button></article></section>
        <section className="mt-6 grid gap-4 md:grid-cols-3">{[["Histórico electoral","Resultados de 2019, 2023 y 2026","/inteligencia-electoral/dashboard"],["Mapa electoral","Puestos, mesas y resultados","/inteligencia-electoral"],["Editor de noticias","Publicación por territorio","/editor/noticias"]].map(([title,text,href]) => <Link key={title} href={href} className="rounded-2xl border border-[#D9C5E3] bg-white p-5 transition hover:-translate-y-1 hover:border-[#8C58A8]"><h3 className="font-bold">{title}</h3><p className="mt-2 text-sm text-[#716677]">{text}</p><span className="mt-4 block text-sm font-bold text-[#5A2D82]">Abrir →</span></Link>)}</section></>}

      {activeTab === "registro" && <section className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_.8fr]"><div className="rounded-3xl border border-[#D6C0E0] bg-white p-6 shadow-lg md:p-8"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#7B3FB6]">Planilla digital</p><h2 className="mt-2 font-serif text-3xl font-bold">Registrar contacto territorial</h2><p className="mt-2 text-sm text-[#6A6071]">Registra únicamente personas que autorizaron el uso de sus datos para la campaña.</p><form onSubmit={saveContact} className="mt-7 grid gap-4 md:grid-cols-2">
        <label className={label}>Territorio<select required value={form.territory_id} onChange={(e) => setForm({...form,territory_id:e.target.value})} className={control}>{campaign?.territories.map((territory) => <option key={territory.id} value={territory.id}>{territory.name} · {territory.status === "active" ? "Activo" : "Preparación"}</option>)}</select></label><label className={label}>Municipio / localidad<input required value={form.municipality} onChange={(e) => setForm({...form,municipality:e.target.value})} className={control} placeholder="Ej. Barranquilla"/></label>
        <label className={label}>Nombre completo<input required minLength={3} value={form.full_name} onChange={(e) => setForm({...form,full_name:e.target.value})} className={control}/></label><label className={label}>Cédula<input required inputMode="numeric" pattern="[0-9]{5,12}" value={form.document_number} onChange={(e) => setForm({...form,document_number:e.target.value})} className={control}/></label>
        <label className={label}>Teléfono<input type="tel" value={form.phone} onChange={(e) => setForm({...form,phone:e.target.value})} className={control}/></label><label className={label}>Correo electrónico<input type="email" value={form.email} onChange={(e) => setForm({...form,email:e.target.value})} className={control}/></label>
        <label className={label}>Puesto de votación<input required value={form.polling_place} onChange={(e) => setForm({...form,polling_place:e.target.value})} className={control} placeholder="Nombre oficial del puesto"/></label><label className={label}>Mesa de votación<input required value={form.polling_table} onChange={(e) => setForm({...form,polling_table:e.target.value})} className={control} placeholder="Ej. 12"/></label>
        <label className={label}>Líder responsable<input required minLength={3} value={form.leader_name} onChange={(e) => setForm({...form,leader_name:e.target.value})} className={control}/></label><label className={label}>Intención actual<select value={form.support_level} onChange={(e) => setForm({...form,support_level:e.target.value})} className={control}><option value="interested">Interesado</option><option value="likely">Probable</option><option value="confirmed">Confirmado</option><option value="undecided">Indeciso</option></select></label>
        <label className={label}>Voto anterior autodeclarado<select value={form.prior_vote_choice} onChange={(e) => setForm({...form,prior_vote_choice:e.target.value})} className={control}><option value="">Prefiere no responder</option><option value="same_project">Mismo proyecto o partido</option><option value="other_project">Otra opción política</option><option value="did_not_vote">No votó</option><option value="first_time">Votará por primera vez</option></select></label><label className={label}>Observaciones<input value={form.notes} onChange={(e) => setForm({...form,notes:e.target.value})} className={control} placeholder="Seguimiento permitido"/></label>
        <label className="md:col-span-2 flex gap-3 rounded-xl bg-[#F5EDF8] p-4 text-sm font-normal leading-6 text-[#5F5365]"><input required checked={form.consent} onChange={(e) => setForm({...form,consent:e.target.checked})} type="checkbox" className="mt-1 h-4 w-4 accent-[#5A2D82]"/>La persona autorizó voluntariamente el registro y tratamiento de sus datos para gestión de campaña y análisis territorial agregado.</label>{error && <p className="md:col-span-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}{message && <p className="md:col-span-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>}<button disabled={saving} className="md:col-span-2 rounded-xl bg-[#5A2D82] py-3.5 font-bold text-white disabled:opacity-60">{saving ? "Guardando…" : "Guardar en base segura"}</button></form></div>
        <aside className="space-y-5"><div className="rounded-3xl bg-[#5A2D82] p-6 text-white"><p className="text-xs font-bold uppercase tracking-[.16em] text-white/60">Protección del dato</p><h3 className="mt-2 text-2xl font-bold">Información privada por campaña</h3><ul className="mt-5 space-y-3 text-sm leading-6 text-white/80"><li>• Solo miembros autorizados pueden consultar registros.</li><li>• Cada contacto conserva quién lo ingresó.</li><li>• El antecedente político siempre es opcional.</li><li>• La participación posterior será autodeclarada; nunca se afirma conocer el voto secreto.</li></ul></div><div className="rounded-3xl border border-[#D6C0E0] bg-white p-6"><h3 className="font-bold">Cobertura inicial</h3>{campaign?.territories.map((territory) => <div key={territory.id} className="mt-3 flex items-center justify-between rounded-xl bg-[#F5EDF8] p-3 text-sm"><b>{territory.name}</b><span>{territory.status}</span></div>)}</div></aside></section>}

      {activeTab === "contactos" && <section className="mt-6 overflow-hidden rounded-3xl border border-[#D6C0E0] bg-white"><div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E7DCEB] p-6"><div><p className="text-xs font-bold uppercase tracking-[.17em] text-[#7B3FB6]">Base autorizada</p><h2 className="mt-2 font-serif text-3xl font-bold">Contactos de campaña</h2></div><button onClick={() => setActiveTab("registro")} className="rounded-xl bg-[#5A2D82] px-5 py-3 text-sm font-bold text-white">＋ Nuevo registro</button></div><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-[#F5EDF8] text-xs uppercase tracking-wide text-[#6B5D72]"><tr><th className="p-4">Persona</th><th className="p-4">Municipio</th><th className="p-4">Puesto / mesa</th><th className="p-4">Líder</th><th className="p-4">Intención</th><th className="p-4">Seguimiento</th></tr></thead><tbody>{contacts.map((contact) => <tr key={contact.id} className="border-t border-[#EEE7F1]"><td className="p-4 font-bold">{contact.full_name}</td><td className="p-4">{contact.municipality}</td><td className="p-4">{contact.polling_place}<small className="block text-[#766B7B]">Mesa {contact.polling_table}</small></td><td className="p-4">{contact.leader_name}</td><td className="p-4"><span className="rounded-full bg-[#F1E7F6] px-3 py-1 text-xs font-bold text-[#5A2D82]">{supportLabels[contact.support_level]}</span></td><td className="p-4">{followupLabels[contact.followup_status]}</td></tr>)}</tbody></table>{!contacts.length && <p className="p-10 text-center text-[#766B7B]">Todavía no existen registros en esta campaña.</p>}</div></section>}

      {activeTab === "territorio" && <section className="mt-6 grid gap-6 lg:grid-cols-[.8fr_1.2fr]"><div className="rounded-3xl border border-[#D6C0E0] bg-white p-6"><p className="text-xs font-bold uppercase tracking-[.17em] text-[#7B3FB6]">Mapa de fuerza</p><h2 className="mt-2 font-serif text-3xl font-bold">Cobertura territorial</h2><p className="mt-3 text-sm leading-6 text-[#6A6071]">La intensidad representa registros voluntarios agregados. No revela preferencias individuales.</p><div className="mt-6 space-y-3">{territoryTotals.map((territory) => <div key={territory.id} className="rounded-xl border border-[#E2D5E8] bg-[#FBF8FC] p-4"><div className="flex justify-between"><b>{territory.name}</b><span className="font-bold text-[#5A2D82]">{territory.total}</span></div><small className="mt-1 block text-[#796D7F]">{territory.status === "active" ? "Territorio activo" : "Preparación de datos"}</small></div>)}</div></div><div className="grid min-h-[500px] place-items-center rounded-3xl border border-[#CFAFDD] bg-[radial-gradient(circle_at_60%_35%,#DFC5E9,#B58BC6)] p-8 text-center"><div><div className="mx-auto grid h-28 w-28 place-items-center rounded-full border-8 border-white/50 bg-[#5A2D82] text-5xl text-white shadow-2xl">⌖</div><h3 className="mt-5 text-2xl font-bold">Análisis por puesto y mesa</h3><p className="mt-3 max-w-xl text-[#5E5065]">Al crecer la base, esta vista mostrará concentración por municipio, puesto y mesa y la comparará con los históricos electorales.</p><Link href="/inteligencia-electoral" className="mt-6 inline-block rounded-full bg-white px-6 py-3 font-bold text-[#5A2D82] shadow-md">Abrir mapa electoral</Link></div></div></section>}
    </main>
  </div>;
}
