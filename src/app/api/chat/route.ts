import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const res = await fetch(
      "https://predicted-meters-mpegs-disciplinary.trycloudflare.com/api/v1/workspace/mi-espacio-de-trabajo/chat",
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

    const raw = await res.text();

    return NextResponse.json({
      status: res.status,
      ok: res.ok,
      raw,
    });
  } catch (error) {
    return NextResponse.json({
      error: String(error),
    });
  }
}