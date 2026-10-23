"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Territory = { id: string; name: string; slug: string; status: string };
type Leader = { id: string; full_name: string; territory_id: string | null };
type PollingPlace = { municipio: string; puesto: string; direccion?: string; mesas?: number };
type VerifiedLocation = { electionName: string | null; department: string; municipality: string; pollingPlace: string; pollingPlaceAddress: string | null; pollingTable: number; source: string; sourceUpdatedAt: string | null };
type VerificationState = { status: "idle" | "checking" | "verified" | "not_found" | "unavailable" | "error"; location?: VerifiedLocation; message?: string };
type InstallPrompt = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

const emptyPerson = { full_name: "", document_number: "", phone: "", email: "", polling_table: "", prior_vote_choice: "", support_level: "interested", notes: "", consent: false };
const inputClass = "mt-2 h-14 w-full rounded-2xl border border-[#D4C2DD] bg-white px-4 text-base outline-none focus:border-[#6B338C] focus:ring-4 focus:ring-[#6B338C]/10";
const labelClass = "block text-sm font-bold text-[#34233F]";
const dataFiles: Record<string, string> = {
  atlantico: "/data/puestos_votacion_atlantico_2023.geojson",
  "norte-de-santander": "/data/puestos_votacion_norte_de_santander_2023.geojson",
  "bogota-dc": "/data/puestos_votacion_bogota_2023.geojson",
  cundinamarca: "/data/puestos_votacion_cundinamarca_2023.geojson",
};

function normalizeName(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]+/g, " ").trim().toUpperCase();
}

export default function FieldCampaignPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [online, setOnline] = useState(() => typeof navigator === "undefined" ? true : navigator.onLine);
  const [userId, setUserId] = useState("");
  const [campaignId, setCampaignId] = useState("");
  const [campaignName, setCampaignName] = useState("");
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [territoryId, setTerritoryId] = useState("");
  const [leaderId, setLeaderId] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [pollingPlace, setPollingPlace] = useState("");
  const [places, setPlaces] = useState<PollingPlace[]>([]);
  const [person, setPerson] = useState(emptyPerson);
  const [censusChecked, setCensusChecked] = useState(false);
  const [lookupConsent, setLookupConsent] = useState(false);
  const [verification, setVerification] = useState<VerificationState>({ status: "idle" });
  const [savedCount, setSavedCount] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [installPrompt, setInstallPrompt] = useState<InstallPrompt | null>(null);
  const [showInstallHelp, setShowInstallHelp] = useState(false);

  useEffect(() => {
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    const onInstall = (event: Event) => { event.preventDefault(); setInstallPrompt(event as InstallPrompt); };
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    window.addEventListener("beforeinstallprompt", onInstall);
    return () => { window.removeEventListener("online", onOnline); window.removeEventListener("offline", onOffline); window.removeEventListener("beforeinstallprompt", onInstall); };
  }, []);

  useEffect(() => {
    async function loadApp() {
      const supabase = createClient();
      if (!supabase) { setError("No está disponible la conexión segura."); setLoading(false); return; }
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;
      if (!user) { router.replace("/login?next=/campana/campo"); return; }
      setUserId(user.id);
      const { data: campaignData, error: campaignError } = await supabase.from("campaigns").select("id,name,campaign_territories(status,territories(id,name,slug))").limit(1).maybeSingle();
      if (campaignError || !campaignData) { setError("No tienes una campaña activa asignada."); setLoading(false); return; }
      const raw = campaignData as unknown as { id: string; name: string; campaign_territories: Array<{ status: string; territories: Territory | Territory[] }> };
      const campaignTerritories = raw.campaign_territories.flatMap((item) => (Array.isArray(item.territories) ? item.territories : [item.territories]).filter(Boolean).map((territory) => ({ ...territory, status: item.status })));
      const [{ data: leaderData }, { count }] = await Promise.all([
        supabase.from("campaign_leaders").select("id,full_name,territory_id").eq("campaign_id", raw.id).eq("active", true).order("full_name"),
        supabase.from("voter_contacts").select("id", { count: "exact", head: true }).eq("campaign_id", raw.id).eq("created_by", user.id),
      ]);
      setCampaignId(raw.id); setCampaignName(raw.name); setTerritories(campaignTerritories); setTerritoryId(""); setLeaders((leaderData || []) as Leader[]); setSavedCount(count || 0); setLoading(false);
    }
    loadApp();
  }, [router]);

  const territory = territories.find((item) => item.id === territoryId);
  const territorySlug = territory?.slug;
  const territoryLeaders = territoryId
    ? leaders.filter((leader) => !leader.territory_id || leader.territory_id === territoryId)
    : [];
  const municipalities = useMemo(() => [...new Set(places.map((place) => place.municipio))].sort((a, b) => a.localeCompare(b, "es")), [places]);
  const municipalityPlaces = useMemo(() => places.filter((place) => place.municipio === municipality).sort((a, b) => a.puesto.localeCompare(b.puesto, "es")), [places, municipality]);
  const selectedPlace = municipalityPlaces.find((place) => place.puesto === pollingPlace);

  useEffect(() => {
    async function loadPlaces() {
      setPlaces([]); setMunicipality(""); setPollingPlace(""); setLeaderId("");
      if (!territorySlug || !dataFiles[territorySlug]) return;
      try {
        const response = await fetch(dataFiles[territorySlug]);
        const geojson = await response.json() as { features: Array<{ properties: PollingPlace }> };
        setPlaces(geojson.features.map((feature) => feature.properties));
      } catch { setError("No fue posible cargar los puestos de votación."); }
    }
    loadPlaces();
  }, [territorySlug]);

  async function installApp() {
    if (installPrompt) { await installPrompt.prompt(); await installPrompt.userChoice; setInstallPrompt(null); return; }
    setShowInstallHelp(true);
  }

  function resetVerification() {
    setCensusChecked(false);
    setVerification({ status: "idle" });
  }

  async function verifyDocument() {
    setError(""); setMessage("");
    const documentNumber = person.document_number.replace(/\D/g, "");
    if (!/^\d{5,12}$/.test(documentNumber)) { setError("Escribe una cédula válida antes de verificar."); return; }
    if (!lookupConsent) { setError("Confirma que la persona autorizó consultar su lugar de votación."); return; }
    if (!territoryId) { setError("Selecciona primero el territorio donde estás trabajando."); return; }

    const supabase = createClient();
    const { data: sessionData } = await supabase?.auth.getSession() || { data: { session: null } };
    const accessToken = sessionData.session?.access_token;
    if (!accessToken) { router.replace("/login?next=/campana/campo"); return; }

    setVerification({ status: "checking" });
    try {
      const response = await fetch("/api/electoral/verify", {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ documentNumber }),
      });
      const result = await response.json() as { ok?: boolean; found?: boolean; code?: string; location?: VerifiedLocation };
      if (response.status === 503 || result.code === "registry_not_ready") {
        setVerification({ status: "unavailable", message: "La base autorizada todavía no ha sido importada. Puedes registrar la ubicación declarada y quedará pendiente de verificación." });
        return;
      }
      if (response.status === 429 || result.code === "rate_limited") {
        setVerification({ status: "error", message: "Se alcanzó el límite temporal de consultas. Espera un minuto y vuelve a intentarlo." });
        return;
      }
      if (!response.ok || !result.ok) {
        setVerification({ status: "error", message: "No fue posible realizar la verificación en este momento." });
        return;
      }
      if (!result.found || !result.location) {
        setVerification({ status: "not_found", message: "La cédula no aparece en la base autorizada disponible. Revisa el número o registra la ubicación como declarada." });
        return;
      }

      const location = result.location;
      if (normalizeName(location.department) !== normalizeName(territory?.name || "")) {
        setVerification({ status: "error", location, message: `La fuente autorizada ubica esta cédula en ${location.department}. Selecciona ese territorio para continuar.` });
        return;
      }
      const municipalityMatch = municipalities.find((name) => normalizeName(name) === normalizeName(location.municipality));
      const placeMatch = places.find((place) => normalizeName(place.municipio) === normalizeName(location.municipality) && normalizeName(place.puesto) === normalizeName(location.pollingPlace));
      if (!municipalityMatch || !placeMatch) {
        setVerification({ status: "error", location, message: "La consulta fue encontrada, pero el puesto aún no está en nuestro catálogo. Un administrador debe actualizar los puestos." });
        return;
      }

      setMunicipality(municipalityMatch);
      setPollingPlace(placeMatch.puesto);
      setPerson((current) => ({ ...current, polling_table: String(location.pollingTable) }));
      setCensusChecked(true);
      setVerification({ status: "verified", location, message: "Lugar de votación verificado y completado automáticamente." });
    } catch {
      setVerification({ status: "error", message: "No fue posible conectarse con el verificador." });
    }
  }

  async function save(event: FormEvent) {
    event.preventDefault(); setError(""); setMessage("");
    if (!online) { setError("Necesitas conexión a internet para guardar de forma segura."); return; }
    if (!censusChecked) { setError("Confirma el lugar de votación antes de guardar el registro."); return; }
    if (!person.consent) { setError("Confirma la autorización de la persona."); return; }
    const leader = leaders.find((item) => item.id === leaderId);
    if (!campaignId || !territoryId || !leader || !userId) { setError("Selecciona territorio y líder."); return; }
    const tableNumber = Number(person.polling_table);
    if (!Number.isInteger(tableNumber) || tableNumber < 1) { setError("Escribe un número de mesa válido."); return; }
    if (selectedPlace?.mesas && tableNumber > selectedPlace.mesas) {
      setError(`Ese puesto tiene mesas de la 1 a la ${selectedPlace.mesas}. Verifica la mesa indicada.`);
      return;
    }
    const supabase = createClient(); if (!supabase) return; setSaving(true);
    const { error: insertError } = await supabase.from("voter_contacts").insert({
      campaign_id: campaignId, territory_id: territoryId, leader_id: leader.id, leader_name: leader.full_name,
      full_name: person.full_name.trim(), document_number: person.document_number.replace(/\D/g, ""), phone: person.phone.trim() || null, email: person.email.trim() || null,
      municipality, polling_place: pollingPlace, polling_table: person.polling_table.trim(), prior_vote_choice: person.prior_vote_choice || null,
      polling_place_address: verification.location?.pollingPlaceAddress || selectedPlace?.direccion || null,
      electoral_verification_status: verification.status === "verified" ? "verified" : "declared",
      electoral_verification_source: verification.status === "verified" ? verification.location?.source || "authorized_registry" : "self_reported",
      electoral_verified_at: verification.status === "verified" ? new Date().toISOString() : null,
      electoral_election_name: verification.status === "verified" ? verification.location?.electionName || null : null,
      support_level: person.support_level, consent_at: new Date().toISOString(), notes: person.notes.trim() || null, created_by: userId,
    });
    setSaving(false);
    if (insertError) { setError(insertError.code === "23505" ? "Esta cédula ya fue registrada en la campaña." : "No se pudo guardar. Revisa los datos o tus permisos."); return; }
    setSavedCount((value) => value + 1); setMessage(`Registro guardado correctamente como ${verification.status === "verified" ? "verificado" : "declarado"}.`); setPerson(emptyPerson); setLookupConsent(false); resetVerification(); window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function signOut() { const supabase = createClient(); await supabase?.auth.signOut(); router.replace("/login"); }

  if (loading) return <main className="grid min-h-screen place-items-center bg-[#EEE3F3]"><div className="text-center"><div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#D8C1E4] border-t-[#5A2D82]"/><p className="mt-4 font-bold text-[#5A2D82]">Abriendo PLANdeC Campo…</p></div></main>;
  if (error && !campaignId) return <main className="grid min-h-screen place-items-center bg-[#EEE3F3] p-6"><div className="rounded-3xl bg-white p-7 text-center shadow-xl"><h1 className="font-serif text-2xl font-bold">No se pudo abrir la aplicación</h1><p className="mt-3 text-sm text-[#6D6072]">{error}</p><Link href="/campana" className="mt-5 inline-block rounded-full bg-[#5A2D82] px-5 py-3 font-bold text-white">Volver al panel</Link></div></main>;

  return <main className="min-h-screen bg-[#EEE3F3] pb-28 text-[#281D34]">
    <header className="sticky top-0 z-30 bg-[#291837] px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))] text-white shadow-xl"><div className="mx-auto max-w-xl"><div className="flex items-center justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#D5B4E4]">PLANdeC Campo</p><h1 className="mt-1 text-xl font-bold">Registro territorial</h1></div><div className={`rounded-full px-3 py-1 text-xs font-bold ${online ? "bg-emerald-400/15 text-emerald-200" : "bg-red-400/15 text-red-200"}`}>{online ? "● En línea" : "● Sin conexión"}</div></div><div className="mt-3 flex items-center justify-between text-xs text-white/65"><span className="truncate">{campaignName}</span><span>{savedCount} registrados</span></div></div></header>

    <div className="mx-auto max-w-xl px-4 py-4">
      <button onClick={installApp} className="mb-4 flex w-full items-center justify-between rounded-2xl border border-[#C9AED6] bg-white p-4 text-left shadow-sm"><span><b className="block text-sm text-[#5A2D82]">📲 Instalar en este celular</b><small className="mt-1 block text-[#75677B]">Abrir desde la pantalla de inicio</small></span><span className="text-2xl">›</span></button>
      {showInstallHelp && <div className="mb-4 rounded-2xl bg-[#FFF7D9] p-4 text-sm leading-6 text-[#5D4A12]"><b>Para instalar:</b> en iPhone pulsa Compartir y “Agregar a inicio”. En Android abre el menú del navegador y pulsa “Instalar aplicación”.</div>}
      {!territoryId && <div className="mb-4 rounded-2xl border border-[#C9AED6] bg-white p-4 text-sm text-[#5A2D82]"><b>Selecciona el territorio donde estás trabajando.</b><br/>Luego aparecerán los municipios, puestos de votación y líderes disponibles.</div>}
      {territoryId && !territoryLeaders.length && <div className="mb-4 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900"><b>No hay líderes en este territorio.</b><br/>El administrador debe crearlos desde el panel antes de registrar personas.</div>}
      {message && <div role="status" className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 font-bold text-emerald-800">✓ {message}</div>}
      {error && campaignId && <div role="alert" className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</div>}

      <form onSubmit={save} className="space-y-4">
        <section className="rounded-3xl border border-[#D4C2DD] bg-white p-5 shadow-sm"><p className="text-xs font-bold uppercase tracking-[.16em] text-[#7B3FB6]">1 · Equipo y territorio</p><div className="mt-4 space-y-4"><label className={labelClass}>Territorio<select required value={territoryId} onChange={(event) => {setTerritoryId(event.target.value);setLookupConsent(false);resetVerification();}} className={inputClass}><option value="">Seleccionar territorio</option>{territories.map((item) => <option key={item.id} value={item.id}>{item.name}{item.status === "active" ? " · Activo" : " · Preparación"}</option>)}</select></label><label className={labelClass}>Líder responsable<select required disabled={!territoryId} value={leaderId} onChange={(event) => setLeaderId(event.target.value)} className={inputClass}><option value="">Seleccionar líder</option>{territoryLeaders.map((leader) => <option key={leader.id} value={leader.id}>{leader.full_name}</option>)}</select></label></div></section>

        <section className="rounded-3xl border border-[#D4C2DD] bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[.16em] text-[#7B3FB6]">2 · Persona y verificación</p>
          <div className="mt-4 space-y-4">
            <label className={labelClass}>Nombre completo<input required minLength={3} autoComplete="name" value={person.full_name} onChange={(event) => setPerson({...person,full_name:event.target.value})} className={inputClass}/></label>
            <label className={labelClass}>Cédula<input required inputMode="numeric" pattern="[0-9]{5,12}" value={person.document_number} onChange={(event) => {setPerson({...person,document_number:event.target.value});resetVerification();}} className={inputClass}/></label>
            <label className="flex gap-3 rounded-2xl border border-[#C9AED6] bg-[#F7F0FA] p-4 text-sm font-normal leading-6"><input type="checkbox" checked={lookupConsent} onChange={(event) => setLookupConsent(event.target.checked)} className="mt-1 h-6 w-6 shrink-0 accent-[#5A2D82]"/><span>La persona autorizó consultar su lugar de votación para completar este registro.</span></label>
            <button type="button" onClick={verifyDocument} disabled={verification.status === "checking" || !person.document_number || !lookupConsent || !territoryId} className="flex min-h-14 w-full items-center justify-center rounded-2xl border-2 border-[#5A2D82] px-4 text-center text-sm font-bold text-[#5A2D82] disabled:border-[#B9A9C1] disabled:text-[#8C7D93]">{verification.status === "checking" ? "Consultando de forma segura…" : "Verificar cédula en PLANdeC"}</button>
            {verification.status !== "idle" && verification.status !== "checking" && <div role="status" className={`rounded-2xl border p-4 text-sm leading-6 ${verification.status === "verified" ? "border-emerald-300 bg-emerald-50 text-emerald-800" : verification.status === "not_found" || verification.status === "unavailable" ? "border-amber-300 bg-amber-50 text-amber-900" : "border-red-200 bg-red-50 text-red-700"}`}><b className="block">{verification.status === "verified" ? "✓ Verificación electoral completada" : verification.status === "not_found" ? "Registro no encontrado" : verification.status === "unavailable" ? "Base autorizada pendiente" : "No se pudo verificar"}</b>{verification.message}{verification.location && <small className="mt-2 block">{verification.location.department} · {verification.location.municipality} · {verification.location.pollingPlace} · Mesa {verification.location.pollingTable}</small>}</div>}
            <p className="text-xs leading-5 text-[#756A7B]">PLANdeC consulta únicamente fuentes autorizadas. La cédula no se envía en la dirección web ni se guarda en la caché del celular.</p>
            <label className={labelClass}>Teléfono<input type="tel" inputMode="tel" autoComplete="tel" value={person.phone} onChange={(event) => setPerson({...person,phone:event.target.value})} className={inputClass}/></label>
            <label className={labelClass}>Correo electrónico <span className="font-normal text-[#817387]">(opcional)</span><input type="email" inputMode="email" autoComplete="email" value={person.email} onChange={(event) => setPerson({...person,email:event.target.value})} className={inputClass}/></label>
          </div>
        </section>

        <section className="rounded-3xl border border-[#D4C2DD] bg-white p-5 shadow-sm"><p className="text-xs font-bold uppercase tracking-[.16em] text-[#7B3FB6]">3 · Lugar de votación</p><div className="mt-4 space-y-4"><label className={labelClass}>Municipio o localidad<select required disabled={!territoryId || verification.status === "verified"} value={municipality} onChange={(event) => {setMunicipality(event.target.value);setPollingPlace("");setPerson({...person,polling_table:""});resetVerification();}} className={inputClass}><option value="">Seleccionar</option>{municipalities.map((name) => <option key={name}>{name}</option>)}</select></label><label className={labelClass}>Puesto de votación<select required disabled={!municipality || verification.status === "verified"} value={pollingPlace} onChange={(event) => {setPollingPlace(event.target.value);setPerson({...person,polling_table:""});resetVerification();}} className={inputClass}><option value="">Seleccionar puesto</option>{municipalityPlaces.map((place) => <option key={`${place.municipio}-${place.puesto}`} value={place.puesto}>{place.puesto}</option>)}</select>{selectedPlace?.direccion && <small className="mt-2 block leading-5 text-[#766A7B]">📍 {selectedPlace.direccion}{selectedPlace.mesas ? ` · ${selectedPlace.mesas} mesas` : ""}</small>}</label><label className={labelClass}>Mesa de votación<input required disabled={!pollingPlace || verification.status === "verified"} type="number" min={1} max={selectedPlace?.mesas || undefined} inputMode="numeric" value={person.polling_table} onChange={(event) => {setPerson({...person,polling_table:event.target.value});resetVerification();}} className={inputClass} placeholder="Ej. 12"/>{selectedPlace?.mesas ? <small className="mt-2 block text-[#766A7B]">Mesas válidas en este puesto: 1 a {selectedPlace.mesas}</small> : null}</label>{verification.status === "verified" ? <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-sm font-bold text-emerald-800">✓ Municipio, puesto y mesa verificados automáticamente.</div> : <label className="flex gap-3 rounded-2xl border border-[#C9AED6] bg-[#F7F0FA] p-4 text-sm font-normal leading-6"><input required disabled={!pollingPlace || !person.polling_table} type="checkbox" checked={censusChecked} onChange={(event) => setCensusChecked(event.target.checked)} className="mt-1 h-6 w-6 shrink-0 accent-[#5A2D82]"/><span>La persona confirma que este es su municipio, puesto y mesa. El registro quedará marcado como declarado hasta verificarlo con una fuente autorizada.</span></label>}</div></section>

        <section className="rounded-3xl border border-[#D4C2DD] bg-white p-5 shadow-sm"><p className="text-xs font-bold uppercase tracking-[.16em] text-[#7B3FB6]">4 · Seguimiento</p><div className="mt-4 space-y-4"><label className={labelClass}>Intención actual<select value={person.support_level} onChange={(event) => setPerson({...person,support_level:event.target.value})} className={inputClass}><option value="interested">Interesado</option><option value="likely">Probable</option><option value="confirmed">Confirmado</option><option value="undecided">Indeciso</option></select></label><label className={labelClass}>Voto anterior autodeclarado<select value={person.prior_vote_choice} onChange={(event) => setPerson({...person,prior_vote_choice:event.target.value})} className={inputClass}><option value="">Prefiere no responder</option><option value="same_project">Mismo proyecto o partido</option><option value="other_project">Otra opción política</option><option value="did_not_vote">No votó</option><option value="first_time">Votará por primera vez</option></select></label><label className={labelClass}>Observaciones <span className="font-normal text-[#817387]">(opcional)</span><textarea rows={3} value={person.notes} onChange={(event) => setPerson({...person,notes:event.target.value})} className="mt-2 w-full rounded-2xl border border-[#D4C2DD] bg-white p-4 text-base outline-none focus:border-[#6B338C]"/></label><label className="flex gap-3 rounded-2xl bg-[#F4ECF7] p-4 text-sm font-normal leading-6"><input required type="checkbox" checked={person.consent} onChange={(event) => setPerson({...person,consent:event.target.checked})} className="mt-1 h-6 w-6 shrink-0 accent-[#5A2D82]"/><span>La persona autorizó el registro y tratamiento de sus datos para la gestión de campaña.</span></label></div></section>

        <button disabled={saving || !online || !territoryLeaders.length} className="h-16 w-full rounded-2xl bg-[#5A2D82] text-lg font-bold text-white shadow-xl disabled:bg-[#A996B2]">{saving ? "Guardando de forma segura…" : "Guardar registro"}</button>
      </form>
      <p className="mt-5 text-center text-[11px] leading-5 text-[#756A7A]">Los datos se envían cifrados a Supabase y no se guardan en la caché del celular.</p>
    </div>

    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[#D6C6DD] bg-white/95 px-4 pb-[max(.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur"><div className="mx-auto flex max-w-xl items-center justify-between"><Link href="/campana" className="rounded-xl px-4 py-2 text-center text-xs font-bold text-[#5A2D82]"><span className="block text-xl">⌂</span>Panel</Link><button type="button" onClick={() => {setPerson(emptyPerson);setLookupConsent(false);resetVerification();setMessage("");setError("");window.scrollTo({top:0,behavior:"smooth"});}} className="rounded-xl bg-[#F1E7F6] px-6 py-2 text-center text-xs font-bold text-[#5A2D82]"><span className="block text-xl">＋</span>Nuevo</button><button type="button" onClick={signOut} className="rounded-xl px-4 py-2 text-center text-xs font-bold text-[#756A7A]"><span className="block text-xl">⇥</span>Salir</button></div></nav>
  </main>;
}
