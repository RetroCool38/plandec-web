import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({
 apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const prompt = `
Eres el asistente oficial de PLANdeC.
PLANdeC es una firma de estrategia política, comunicación, marketing político, inteligencia electoral y tecnología aplicada.

Responde en español, breve, profesional y útil.

Si el usuario saluda, saluda y ofrece ayuda sobre PLANdeC.

Pregunta:
${message}
`;

    const result = await ai.models.generateContent({
      model: "gemini-1.5-flash-latest",
      contents: prompt,
    });

    const reply =
      result.candidates?.[0]?.content?.parts
        ?.map((part) => part.text || "")
        .join("")
        .trim() ||
      result.text ||
      "Hola, soy el asistente IA de PLANdeC. Puedo ayudarte con servicios, estrategia política, inteligencia electoral y contacto.";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Error Gemini:", error);
    return NextResponse.json(
      { reply: "Hubo un problema conectando con la IA." },
      { status: 500 }
    );
  }
}