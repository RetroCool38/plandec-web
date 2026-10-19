"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [invitedEmail, setInvitedEmail] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [recoveryMessage, setRecoveryMessage] = useState("");

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active && data.session?.user.email) setInvitedEmail(data.session.user.email);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user.email) setInvitedEmail(session.user.email);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function handleCreatePassword(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      setError("La base de datos todavía no está conectada en este entorno.");
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError("No fue posible crear la contraseña. Solicita una invitación nueva.");
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", invitedEmail ? (await supabase.auth.getUser()).data.user?.id : "").maybeSingle();
    router.push(profile?.role === "editor" ? "/editor/noticias" : "/campana");
    router.refresh();
  }

  async function handlePasswordRecovery() {
    setError("");
    setRecoveryMessage("");
    if (!email) {
      setError("Escribe primero tu correo para enviarte el enlace seguro.");
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      setError("La base de datos todavía no está conectada en este entorno.");
      return;
    }

    setLoading(true);
    const { error: recoveryError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    setLoading(false);
    if (recoveryError) {
      setError("No fue posible enviar el enlace. Revisa el correo e inténtalo de nuevo.");
      return;
    }
    setRecoveryMessage("Te enviamos un enlace seguro. Ábrelo desde el mismo navegador y crea una contraseña de 8 caracteres o más.");
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    const supabase = createClient();
    if (!supabase) {
      setError("La base de datos todavía no está conectada en este entorno.");
      return;
    }

    setLoading(true);
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError || !data.user) {
      setError("Correo o contraseña incorrectos.");
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
    if (profile?.role === "editor") {
      router.push("/editor/noticias");
      router.refresh();
      return;
    }

    const { data: membership } = await supabase.from("campaign_members").select("campaign_id").eq("user_id", data.user.id).eq("active", true).limit(1).maybeSingle();
    if (profile?.role !== "admin" && !membership) {
      await supabase.auth.signOut();
      setError("Este usuario no tiene un permiso activo en PLANdeC.");
      setLoading(false);
      return;
    }

    router.push("/campana");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="grid overflow-hidden rounded-3xl border border-[#D4BDDF] bg-white shadow-2xl shadow-[#5A2D82]/10 lg:grid-cols-2">
        <div className="bg-[#291837] p-10 text-white">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-[#D4AFE5]">Aplicación privada</p>
          <h1 className="mt-4 font-serif text-4xl font-bold">Centro de campaña PLANdeC</h1>
          <p className="mt-5 leading-7 text-white/70">Histórico electoral, registro territorial, mapa de fortalezas y gestión editorial en un solo lugar.</p>
          <div className="mt-8 grid grid-cols-2 gap-3 text-sm">{["Datos históricos", "Noticias", "Mapa territorial", "Estadísticas"].map((item) => <span key={item} className="rounded-xl bg-white/10 p-3">✓ {item}</span>)}</div>
        </div>
        <form onSubmit={invitedEmail ? handleCreatePassword : handleSubmit} className="p-10">
          <h2 className="text-2xl font-bold">{invitedEmail ? "Crea tu contraseña" : "Acceso seguro"}</h2>
          <p className="mt-3 text-sm leading-6 text-[#6A6071]">{invitedEmail ? `Invitación aceptada para ${invitedEmail}. Define una contraseña para activar tu acceso.` : "Ingresa con el usuario autorizado de PLANdeC. Los permisos se validan en la base de datos."}</p>
          {!isSupabaseConfigured && <div className="mt-5 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">La conexión a Supabase está pendiente de configurar.</div>}
          {!invitedEmail && <label className="mt-7 block text-xs font-bold">Correo<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="usuario@plandec.com" className="mt-2 h-12 w-full rounded-xl border border-[#D8C8E0] bg-white px-4 outline-none focus:border-[#5A2D82]" /></label>}
          <label className={`${invitedEmail ? "mt-7" : "mt-4"} block text-xs font-bold`}>{invitedEmail ? "Nueva contraseña" : "Contraseña"}<input required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="••••••••" className="mt-2 h-12 w-full rounded-xl border border-[#D8C8E0] bg-white px-4 outline-none focus:border-[#5A2D82]" /></label>
          {invitedEmail && <p className="mt-2 text-xs text-[#6A6071]">Usa 8 caracteres o más y combina letras, números y un símbolo.</p>}
          {invitedEmail && <label className="mt-4 block text-xs font-bold">Confirmar contraseña<input required minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} type="password" placeholder="••••••••" className="mt-2 h-12 w-full rounded-xl border border-[#D8C8E0] bg-white px-4 outline-none focus:border-[#5A2D82]" /></label>}
          {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          {recoveryMessage && <p role="status" className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{recoveryMessage}</p>}
          <button disabled={loading || !isSupabaseConfigured} className="mt-5 w-full rounded-xl bg-[#5A2D82] py-3.5 font-bold text-white disabled:cursor-not-allowed disabled:bg-[#A58DAF]">{loading ? "Guardando…" : invitedEmail ? "Crear contraseña e ingresar" : "Ingresar"}</button>
          {!invitedEmail && <button type="button" onClick={handlePasswordRecovery} disabled={loading || !isSupabaseConfigured} className="mt-3 w-full py-2 text-sm font-bold text-[#5A2D82] underline underline-offset-4 disabled:text-[#A58DAF]">Crear o recuperar contraseña</button>}
        </form>
      </div>
    </div>
  );
}
