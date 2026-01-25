import { countRows } from "@/server/lwow/db";

export const runtime = "nodejs";

export async function GET() {
  try {
    const rows = countRows();
    return Response.json({ ok: true, rows });
  } catch (e) {
    console.error(e);
    return Response.json({ ok: false }, { status: 500 });
  }
}
