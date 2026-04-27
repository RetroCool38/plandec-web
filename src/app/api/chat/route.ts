import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { message } = await req.json();

  const res = await fetch(
    `${process.env.https://paste-barrel-win-charts.trycloudflare.com}/api/v1/workspace/${process.env.mi-espacio-de-trabajo}/chat`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.FASFEKZ-G3148S7-MH4DG5P-B4DR607}`,
      },
      body: JSON.stringify({
        message,
        mode: "chat",
      }),
    }
  );

  const data = await res.json();
  return NextResponse.json(data);
}