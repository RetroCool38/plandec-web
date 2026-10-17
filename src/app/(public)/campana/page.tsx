"use client";

import Link from "next/link";
import { useState } from "react";

const modules = [
  { number: "01", title: "Histórico electoral", text: "Resultados por año, corporación, municipio, puesto y mesa.", href: "/inteligencia-electoral/dashboard", action: "Abrir histórico" },
  { number: "02", title: "Registro territorial", text: "Planillas digitales con datos de contacto, líder, puesto y mesa de votación.", href: "#registro", action: "Ver formulario" },
  { number: "03", title: "Mapa de fortaleza", text: "Concentración agregada de apoyos para identificar territorios fuertes y por fortalecer.", href: "#territorio", action: "Ver territorio" },
  { number: "04", title: "Dashboard de campaña", text: "Cruce entre registros voluntarios e histórico electoral con indicadores agregados.", href: "#indicadores", action: "Ver indicadores" },
];

const fields = [
  ["Nombre completo", "text"], ["Cédula", "text"], ["Teléfono", "tel"], ["Correo electrónico", "email"],
  ["Puesto de votación", "text"], ["Mesa de votación", "text"], ["Líder responsable", "text"],
] as const;

export default function CampaignAppPage() {
  const [notice, setNotice] = useState(false);
  return <div className="min-h-screen bg-[#EEE3F3] text-[#281D34]">
    <header className="bg-[#271735] px-5 py-10 text-white lg:px-10">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-end justify-between gap-6">
        <div><p className="text-xs font-bold uppercase tracking-[.22em] text-[#D4AFE5]">Centro de campaña · Beta</p><h1 className="mt-3 font-serif text-4xl font-bold md:text-5xl">Gestión territorial PLANdeC</h1><p className="mt-4 max-w-3xl text-white/70">Organiza la información de campaña, entiende el territorio y compara los registros voluntarios con el comportamiento electoral histórico.</p></div>
        <span className="rounded-full border border-[#B98BD0]/50 bg-[#5A2D82] px-5 py-2 text-sm font-bold">Vista de diseño · sin datos reales</span>
      </div>
    </header>

    <main className="mx-auto max-w-[1400px] px-5 py-8 lg:px-10">
      <nav className="grid gap-3 md:grid-cols-4">{modules.map((module) => <a key={module.number} href={module.href} className="group rounded-2xl border border-[#D9C5E3] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#8C58A8] hover:shadow-lg"><span className="text-xs font-black tracking-[.18em] text-[#8A54A5]">{module.number}</span><h2 className="mt-3 text-lg font-bold">{module.title}</h2><p className="mt-2 min-h-16 text-sm leading-6 text-[#6D6273]">{module.text}</p><span className="mt-4 inline-block text-sm font-bold text-[#5A2D82]">{module.action} →</span></a>)}</nav>

      <section id="indicadores" className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[{ label: "Elecciones históricas", value: "13", note: "2019 · 2023 · 2026" }, { label: "Municipios disponibles", value: "23", note: "Departamento del Atlántico" }, { label: "Puestos georreferenciados", value: "329", note: "Mapa electoral actual" }, { label: "Registros de campaña", value: "0", note: "Base segura pendiente" }].map((item) => <article key={item.label} className="rounded-2xl border border-[#D9C5E3] bg-white p-5"><p className="text-xs font-bold uppercase tracking-[.14em] text-[#766B7B]">{item.label}</p><strong className="mt-3 block text-4xl text-[#5A2D82]">{item.value}</strong><span className="mt-2 block text-xs text-[#817486]">{item.note}</span></article>)}
      </section>

      <section id="registro" className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
        <div className="rounded-3xl border border-[#D6C0E0] bg-white p-6 shadow-lg shadow-[#5A2D82]/5 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#7B3FB6]">Nueva planilla</p><h2 className="mt-2 font-serif text-3xl font-bold">Registrar contacto territorial</h2><p className="mt-2 text-sm text-[#6A6071]">La ubicación electoral permitirá hacer análisis agregado por puesto y mesa.</p></div><span className="rounded-full bg-[#F0E3F6] px-4 py-2 text-xs font-bold text-[#5A2D82]">Requiere acceso autorizado</span></div>
          <form onSubmit={(event) => { event.preventDefault(); setNotice(true); }} className="mt-7 grid gap-4 md:grid-cols-2">
            {fields.map(([label, type]) => <label key={label} className="text-xs font-bold text-[#46394E]">{label}<input type={type} placeholder={label} className="mt-2 h-12 w-full rounded-xl border border-[#D7C7DE] bg-[#FCFAFD] px-4 text-sm font-normal outline-none focus:border-[#713B91]" /></label>)}
            <label className="text-xs font-bold text-[#46394E]">Antecedente político autodeclarado<select className="mt-2 h-12 w-full rounded-xl border border-[#D7C7DE] bg-[#FCFAFD] px-4 text-sm font-normal"><option>Prefiere no responder</option><option>Votó por otra opción</option><option>Votó por el mismo proyecto</option><option>No votó anteriormente</option></select></label>
            <label className="md:col-span-2 flex gap-3 rounded-xl bg-[#F5EDF8] p-4 text-sm font-normal leading-6 text-[#5F5365]"><input type="checkbox" className="mt-1 h-4 w-4 accent-[#5A2D82]" />La persona autoriza voluntariamente el registro y tratamiento de sus datos para gestión de campaña y análisis territorial agregado.</label>
            <button type="submit" className="md:col-span-2 rounded-xl bg-[#5A2D82] py-3.5 font-bold text-white shadow-md hover:bg-[#7138A3]">Guardar en base segura</button>
          </form>
          {notice && <div className="mt-4 rounded-xl border border-[#D6BDE2] bg-[#F4EAF8] p-4 text-sm text-[#4F3C59]"><b>Formulario listo para conectar.</b> El guardado se activará cuando configuremos usuarios, permisos y la base de datos protegida.</div>}
        </div>

        <aside className="space-y-5">
          <div className="rounded-3xl bg-[#5A2D82] p-6 text-white"><p className="text-xs font-bold uppercase tracking-[.16em] text-white/60">Reglas del dato</p><h3 className="mt-2 text-2xl font-bold">Información voluntaria y verificable</h3><ul className="mt-5 space-y-3 text-sm leading-6 text-white/80"><li>• El voto individual nunca se presenta como un hecho comprobado.</li><li>• El antecedente político es opcional y autodeclarado.</li><li>• Los análisis territoriales muestran totales agregados.</li><li>• Cada registro conserva quién lo ingresó y cuándo.</li></ul></div>
          <div className="rounded-3xl border border-[#D6C0E0] bg-white p-6"><h3 className="text-xl font-bold">Acceso por roles</h3><div className="mt-4 space-y-3 text-sm"><div className="rounded-xl bg-[#F5EDF8] p-3"><b>Administrador</b><span className="block text-[#726677]">Configuración y reportes generales</span></div><div className="rounded-xl bg-[#F5EDF8] p-3"><b>Coordinador</b><span className="block text-[#726677]">Municipios, líderes y seguimiento</span></div><div className="rounded-xl bg-[#F5EDF8] p-3"><b>Líder</b><span className="block text-[#726677]">Registro de sus contactos autorizados</span></div></div></div>
        </aside>
      </section>

      <section id="territorio" className="mt-8 overflow-hidden rounded-3xl border border-[#D6C0E0] bg-white shadow-lg shadow-[#5A2D82]/5"><div className="grid lg:grid-cols-[.75fr_1.25fr]"><div className="p-7"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#7B3FB6]">Mapa de fortaleza</p><h2 className="mt-2 font-serif text-3xl font-bold">Dónde estamos fuertes y dónde crecer</h2><p className="mt-4 leading-7 text-[#6A6071]">El mapa combinará registros autorizados, puestos de votación e históricos. La intensidad se calculará por territorio, sin señalar preferencias individuales.</p><div className="mt-6 space-y-3"><div className="flex items-center gap-3"><span className="h-4 w-4 rounded-full bg-[#3C8F63]" />Fortaleza alta</div><div className="flex items-center gap-3"><span className="h-4 w-4 rounded-full bg-[#D3A53C]" />Oportunidad</div><div className="flex items-center gap-3"><span className="h-4 w-4 rounded-full bg-[#A55767]" />Presencia baja</div></div></div><div className="grid min-h-[360px] place-items-center bg-[radial-gradient(circle_at_center,#F5EAF9,#CFB1DD)] p-8 text-center"><div><div className="mx-auto grid h-24 w-24 place-items-center rounded-full border-8 border-white/60 bg-[#5A2D82] text-4xl text-white shadow-xl">⌖</div><h3 className="mt-5 text-xl font-bold">Esperando registros territoriales</h3><p className="mt-2 text-sm text-[#6A6071]">El mapa de calor se activará después de conectar la base segura.</p><Link href="/inteligencia-electoral" className="mt-5 inline-block rounded-full border border-[#5A2D82] bg-white px-5 py-2.5 text-sm font-bold text-[#5A2D82]">Consultar mapa histórico</Link></div></div></div></section>
    </main>
  </div>;
}
