import { supabase } from "@/lib/supabase";
import { sendEventNotification } from "@/lib/email";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const includeExpired = req.nextUrl.searchParams.get("include_expired") === "true";

  let query = supabase
    .from("pins")
    .select("*")
    .order("created_at", { ascending: false });

  if (!includeExpired) {
    // Filter out temporary events past their end_date
    query = query.or(`end_date.is.null,end_date.gte.${new Date().toISOString()}`);
  }

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { lat, lng, title, description, category, visitor_id, start_date, end_date, address } = body;

  if (!title || !category) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!lat && !lng && !address && !start_date) {
    return NextResponse.json({ error: "Must provide location, address, or event date" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("pins")
    .insert([{
      lat: lat || null,
      lng: lng || null,
      title,
      description: description || "",
      category,
      visitor_id: visitor_id || "anonymous",
      start_date: start_date || null,
      end_date: end_date || null,
      address: address || null,
    }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Send email notification for events
  if (start_date) {
    sendEventNotification(data);
  }

  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();

  const { error } = await supabase.from("pins").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
