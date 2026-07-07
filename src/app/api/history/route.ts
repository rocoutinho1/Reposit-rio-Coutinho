import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@netlify/blobs";
import { HistoryEntry } from "@/lib/history";

function historyStore() {
  return getStore("proposals-history");
}

export async function GET() {
  const store = historyStore();
  const { blobs } = await store.list();
  const entries = await Promise.all(
    blobs.map(({ key }) => store.get(key, { type: "json" }) as Promise<HistoryEntry | null>)
  );
  return NextResponse.json(entries.filter((e): e is HistoryEntry => e !== null));
}

export async function POST(request: NextRequest) {
  const entry: HistoryEntry = await request.json();
  const store = historyStore();
  await store.setJSON(entry.id, entry);
  return NextResponse.json({ ok: true });
}
