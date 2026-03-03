import { NextResponse } from "next/server";
import { sql } from "../../../../lib/db";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await ctx.params;

    const link = await sql<
      { code: string; target_url: string; created_at: string }[]
    >`
      select code, target_url, created_at
      from links
      where code = ${code}
      limit 1
    `;

    if (link.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const countRows = await sql<{ count: number }[]>`
      select count(*)::int as count from clicks where code = ${code}
    `;

    const recent = await sql<
      { ts: string; referrer: string | null; user_agent: string | null }[]
    >`
      select ts, referrer, user_agent
      from clicks
      where code = ${code}
      order by ts desc
      limit 25
    `;

    return NextResponse.json({
      link: link[0],
      clicks: countRows[0]?.count ?? 0,
      recent,
    });
  } catch (e: any) {
    // This will show up in the terminal running `npm run dev`
    console.error("STATS ROUTE ERROR", {
      message: e?.message,
      name: e?.name,
      code: e?.code,
      stack: e?.stack,
      url: req.url,
    });

    return NextResponse.json(
      { error: "Stats route failed (see server console)" },
      { status: 500 }
    );
  }
}