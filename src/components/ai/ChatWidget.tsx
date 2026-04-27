"use client";

import { useState } from "react";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("Hola, soy el asistente IA de PLANdeC. Puedes preguntarme sobre el documento cargado.");
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
  if (!message.trim()) return;

  setLoading(true);

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    const data = await res.json();

    setReply(data.textResponse || "No encontré una respuesta clara.");
  } catch (error) {
    setReply("Error de conexión con la IA.");
  }

  setMessage("");
  setLoading(false);
}

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-[9999] rounded-full bg-[#5A2D82] px-6 py-3 text-white font-semibold shadow-2xl hover:bg-[#6f38a0] transition"
      >
        💬 IA PLANdeC
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-[9999] w-[380px] overflow-hidden rounded-2xl border border-white/10 bg-[#0B1020] text-white shadow-2xl">
          <div className="bg-[#5A2D82] px-5 py-4">
            <p className="text-sm uppercase tracking-[0.2em] text-white/70">
              Asistente IA
            </p>
            <h3 className="text-lg font-bold">PLANdeC</h3>
          </div>

          <div className="h-80 overflow-y-auto px-5 py-4 text-sm leading-relaxed text-white/85">
            {loading ? "Espera un momento..." : reply}
          </div>

          <div className="border-t border-white/10 p-4">
            <div className="flex gap-2">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendMessage();
                }}
                placeholder="Escribe tu pregunta..."
                className="flex-1 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none"
              />

              <button
                onClick={sendMessage}
                className="rounded-xl bg-[#5A2D82] px-4 py-2 text-sm font-semibold text-white hover:bg-[#6f38a0]"
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}