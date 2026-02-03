import type { Pin } from "./types";

export async function sendEventNotification(event: Pin) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    await fetch(`${baseUrl}/api/notify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    });
  } catch {
    // Fail silently -- email failure shouldn't block event creation
  }
}
