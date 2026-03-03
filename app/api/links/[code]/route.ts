import { NextResponse } from "next/server";
import { sql } from "../../../../lib/db";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ code: string }> }
) {
  const { code } = await ctx.params;

  const link = await sql<
    { code: string; target_url: string; created_at: string; drive_title: string | null }[]
  >`
    select code, target_url, created_at, drive_title
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
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ code: string }> }
) {
  const { code } = await ctx.params;

  // clicks table should already be ON DELETE CASCADE via FK
  const result = await sql<{ deleted: number }[]>`
    with del as (
      delete from links
      where code = ${code}
      returning 1
    )
    select count(*)::int as deleted from del
  `;

  const deleted = result[0]?.deleted ?? 0;

  if (deleted === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, code });
}