import { NextResponse } from "next/server";
import { DEMO_COOKIE, demoPassword, demoToken } from "@/lib/demo-gate";

function safeNext(raw: FormDataEntryValue | null): string {
  const next = typeof raw === "string" ? raw : "/";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

export async function POST(request: Request) {
  const form = await request.formData();
  const next = safeNext(form.get("next"));
  const password = demoPassword();
  if (!password) return NextResponse.redirect(new URL(next, request.url), 303);

  const given = typeof form.get("password") === "string" ? String(form.get("password")) : "";
  if (given.trim() !== password) {
    const back = new URL("/unlock", request.url);
    back.searchParams.set("next", next);
    back.searchParams.set("error", "1");
    return NextResponse.redirect(back, 303);
  }

  const res = NextResponse.redirect(new URL(next, request.url), 303);
  res.cookies.set(DEMO_COOKIE, await demoToken(password), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
