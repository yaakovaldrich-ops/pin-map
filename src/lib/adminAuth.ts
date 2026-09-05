import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";

/**
 * Admin sessions.
 *
 * Before this existed, /api/auth only returned {authenticated:true} and the
 * admin page flipped a React state flag. Nothing on the server ever checked
 * again, so DELETE /api/pins and PUT /api/config were callable by anyone with
 * curl. Now logging in sets a signed, httpOnly cookie and the destructive
 * routes verify it.
 */

export const ADMIN_COOKIE = "pinmap_admin";
const SESSION_MS = 12 * 60 * 60 * 1000; // 12 hours

function secret(): string {
  const s = process.env.ADMIN_PASSWORD;
  if (!s) throw new Error("ADMIN_PASSWORD is not configured");
  return s;
}

function sign(expiresAt: number): string {
  return createHmac("sha256", secret()).update(String(expiresAt)).digest("hex");
}

/** Constant-time compare that tolerates differing lengths. */
export function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

export function createSessionToken(): { value: string; maxAge: number } {
  const expiresAt = Date.now() + SESSION_MS;
  return { value: `${expiresAt}.${sign(expiresAt)}`, maxAge: SESSION_MS / 1000 };
}

export function isAdmin(req: NextRequest): boolean {
  const raw = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!raw) return false;

  const [expStr, mac] = raw.split(".");
  const expiresAt = Number(expStr);
  if (!expStr || !mac || !Number.isFinite(expiresAt) || Date.now() > expiresAt) {
    return false;
  }

  try {
    return safeEqual(mac, sign(expiresAt));
  } catch {
    // ADMIN_PASSWORD missing - fail closed rather than 500.
    return false;
  }
}

export function unauthorized(): NextResponse {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
