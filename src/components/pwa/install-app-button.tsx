"use client";

import { useEffect, useState } from "react";

type InstallPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export default function InstallAppButton() {
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPrompt(event as InstallPrompt);
    };
    const onInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function install() {
    if (prompt) {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      if (choice.outcome === "accepted") setInstalled(true);
      setPrompt(null);
      return;
    }
    setShowHelp((value) => !value);
  }

  if (installed) return <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-center text-sm font-bold text-emerald-800">✓ PLANdeC ya está instalada en este dispositivo.</p>;

  return <div className="mt-4">
    <button type="button" onClick={install} className="w-full rounded-xl border-2 border-[#5A2D82] bg-white py-3.5 font-bold text-[#5A2D82] shadow-sm">📲 Instalar aplicación móvil</button>
    {showHelp && <div className="mt-3 rounded-xl bg-[#FFF7D9] p-3 text-sm leading-6 text-[#5D4A12]"><b>Android:</b> abre esta página en Chrome y usa el menú ⋮ → “Instalar aplicación”.<br/><b>iPhone:</b> abre esta página en Safari y pulsa Compartir → “Agregar a inicio”.</div>}
  </div>;
}
