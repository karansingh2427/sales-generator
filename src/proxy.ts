import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { DEMO_COOKIE, demoPassword, demoToken } from "@/lib/demo-gate";

export async function proxy(request: NextRequest) {
  const password = demoPassword();
  if (!password) return NextResponse.next();

  const cookie = request.cookies.get(DEMO_COOKIE)?.value;
  if (cookie && cookie === (await demoToken(password))) return NextResponse.next();

  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Password required" }, { status: 401 });
  }
  const unlock = new URL("/unlock", request.url);
  unlock.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(unlock);
}

export const config = {
  matcher: ["/((?!unlock|api/unlock|_next/static|_next/image|favicon.ico).*)"],
};
