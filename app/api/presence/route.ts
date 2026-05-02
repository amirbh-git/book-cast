import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { sessionId } = await request.json();
    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json({ error: "sessionId required" }, { status: 400 });
    }

    const sql = getDb();

    await sql`
      INSERT INTO presence (session_id, last_seen)
      VALUES (${sessionId}, NOW())
      ON CONFLICT (session_id) DO UPDATE SET last_seen = NOW()
    `;

    await sql`DELETE FROM presence WHERE last_seen < NOW() - INTERVAL '15 seconds'`;

    const result = await sql`SELECT COUNT(*)::int AS count FROM presence`;

    return NextResponse.json({ count: result[0].count });
  } catch (e) {
    console.error("Presence error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
