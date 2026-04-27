import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const res = await fetch(
     "https://predicted-meters-mpegs-disciplinary.trycloudflare.com",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer FASFEKZ-G3148S7-MH4DG5P-B4DR607",
        },
        body: JSON.stringify({
          message,
          mode: "chat",
        }),
      }
    );

    const data = await res.json();

    return NextResponse.json({
      textResponse: data.textResponse,
    });
  } catch (error) {
    return NextResponse.json(
      {
        textResponse: "Error conectando con la IA.",
      },
      { status: 500 }
    );
  }
}