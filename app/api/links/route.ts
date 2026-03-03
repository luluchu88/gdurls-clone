import { NextResponse } from "next/server";
import { sql } from "../../../lib/db";
import { isProbablyValidUrl, makeCode, extractDriveFileId } from "../../../lib/utils";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const url = body?.url;

  if (typeof url !== "string" || !isProbablyValidUrl(url)) {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 });
  }

  const driveFileId = extractDriveFileId(url);

  // Allocate a unique code (retry on collisions)
  let code = "";
  for (let i = 0; i < 8; i++) {
    code = makeCode(7);
    try {
      await sql`
        insert into links (code, target_url, drive_file_id)
        values (${code}, ${url}, ${driveFileId})
      `;
      break;
    } catch {
      if (i === 7) {
        return NextResponse.json({ error: "Could not allocate code" }, { status: 500 });
      }
    }
  }

  const base = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");

  return NextResponse.json({
    code,
    short_url: `${base}/x/${code}`,
    target_url: url,
    drive_file_id: driveFileId,
  });
}