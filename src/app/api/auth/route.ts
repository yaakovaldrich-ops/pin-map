import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, createSessionToken, safeEqual } from "@/lib/adminAuth";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return NextResponse.json({ error: "Admin password not configured" }, { status: 500 });
  }

  if (typeof password !== "string" || !safeEqual(password, adminPassword)) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const { value, maxAge } = createSessionToken();
  const res = NextResponse.json({ authenticated: true });
  res.cookies.set(ADMIN_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge,
  });
  return res;
}

/** Log out. */
export async function DELETE() {
  const res = NextResponse.json({ authenticated: false });
  res.cookies.set(ADMIN_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
