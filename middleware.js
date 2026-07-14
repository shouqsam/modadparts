import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "./lib/auth";

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Auth for import is handled inside the route (matcher excludes this path).
  if (pathname === "/api/admin/import") {
    return NextResponse.next();
  }

  const isApiAdmin = pathname.startsWith("/api/admin") && pathname !== "/api/admin/login";
  const isAdminPage = pathname.startsWith("/admin") && pathname !== "/admin/login";

  if (!isApiAdmin && !isAdminPage) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const valid = await verifySessionToken(token);

  if (valid) return NextResponse.next();

  if (isApiAdmin) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const loginUrl = new URL("/admin/login", request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  // Exclude Excel import so middleware does not clone/truncate large upload bodies.
  matcher: ["/admin/:path*", "/api/admin/((?!import$).*)"]
};
