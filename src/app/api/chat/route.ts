import OpenAI from "openai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ reply: "Escribe una pregunta para poder ayudarte." }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { reply: "El asistente está en preparación. Falta configurar la clave de OpenAI en este entorno." },
        { status: 503 }
      );
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5.4-mini",
      instructions: "Eres el asistente oficial de PLANdeC, una firma de estrategia política, comunicación, marketing político, inteligencia electoral y tecnología aplicada. Responde en español, de manera breve, profesional y útil. No afirmes conocer información privada ni resultados electorales que no estén en el contexto de la conversación.",
      input: message.trim(),
      max_output_tokens: 350,
      store: false,
    });

    const reply = response.output_text.trim() || "No encontré una respuesta clara.";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Error OpenAI:", error);
    return NextResponse.json(
      { reply: "Hubo un problema conectando con la IA." },
      { status: 500 }
    );
  }
}
