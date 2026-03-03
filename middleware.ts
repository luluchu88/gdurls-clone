import { NextRequest, NextResponse } from "next/server";

function unauthorized() {
  return new NextResponse("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="gdurls admin", charset="UTF-8"',
    },
  });
}

function isValidBasicAuth(req: NextRequest) {
  const adminUser = process.env.ADMIN_USER || "admin";
  const adminPass = process.env.ADMIN_PASSWORD || "";

  if (!adminPass) return false;

  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Basic ")) return false;

  const b64 = auth.slice("Basic ".length).trim();

  let decoded = "";
  try {
    decoded = Buffer.from(b64, "base64").toString("utf8");
  } catch {
    return false;
  }

  const sep = decoded.indexOf(":");
  if (sep === -1) return false;

  const user = decoded.slice(0, sep);
  const pass = decoded.slice(sep + 1);

  return user === adminUser && pass === adminPass;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public: redirects must be usable by anyone
  if (pathname.startsWith("/x/")) {
    return NextResponse.next();
  }

  // Protect dashboard + all link APIs (create/stats/delete/list)
  const isProtected =
    pathname.startsWith("/dashboard") || pathname.startsWith("/api/links");

  if (!isProtected) {
    return NextResponse.next();
  }

  if (!isValidBasicAuth(req)) {
    return unauthorized();
  }

  return NextResponse.next();
}

// Apply middleware only to relevant routes
export const config = {
  matcher: ["/dashboard/:path*", "/api/links/:path*"],
};