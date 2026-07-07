import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@netlify/blobs";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const store = getStore("proposals-history");
  await store.delete(id);
  return NextResponse.json({ ok: true });
}
