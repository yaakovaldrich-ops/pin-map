import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  if (!process.env.RESEND_API_KEY || !process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Email not configured" }, { status: 500 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const event = await req.json();

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
      to: process.env.ADMIN_EMAIL,
      subject: `New Event: ${event.title}`,
      html: `
        <h2>New Event: ${event.title}</h2>
        <p><strong>Category:</strong> ${event.category}</p>
        <p><strong>Description:</strong> ${event.description || "N/A"}</p>
        <p><strong>Start:</strong> ${event.start_date ? new Date(event.start_date).toLocaleString() : "N/A"}</p>
        <p><strong>End:</strong> ${event.end_date ? new Date(event.end_date).toLocaleString() : "Permanent"}</p>
        <p><strong>Location:</strong> ${event.address || (event.lat ? `${event.lat}, ${event.lng}` : "No location")}</p>
      `,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to send email:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
