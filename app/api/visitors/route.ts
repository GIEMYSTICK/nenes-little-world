import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
const counterUrl = "https://counterapi.com/api/nenes-little-world/view/all-visitors";

async function readCounter(increment: boolean) {
  const response = await fetch(`${counterUrl}${increment ? "" : "?readOnly=true"}`, { cache: "no-store", headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error("Counter service unavailable");
  const data = await response.json() as { value?: number };
  return typeof data.value === "number" ? data.value : 0;
}

export async function GET() {
  try { return NextResponse.json({ count: await readCounter(false) }); }
  catch { return NextResponse.json({ message: "Counter unavailable" }, { status: 503 }); }
}

export async function POST() {
  try { return NextResponse.json({ count: await readCounter(true) }); }
  catch { return NextResponse.json({ message: "Counter unavailable" }, { status: 503 }); }
}
