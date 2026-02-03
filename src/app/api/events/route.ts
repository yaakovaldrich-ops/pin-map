import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const year = req.nextUrl.searchParams.get("year");
  const month = req.nextUrl.searchParams.get("month");

  let query = supabase
    .from("pins")
    .select("*")
    .not("start_date", "is", null);

  if (year && month) {
    const m = month.padStart(2, "0");
    const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
    const startOfMonth = `${year}-${m}-01T00:00:00.000Z`;
    const endOfMonth = `${year}-${m}-${daysInMonth}T23:59:59.999Z`;
    query = query.gte("start_date", startOfMonth).lte("start_date", endOfMonth);
  }

  const { data, error } = await query.order("start_date", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const now = new Date();
  const events = (data || []).map((e) => ({
    ...e,
    is_past: e.end_date ? new Date(e.end_date) < now : false,
  }));

  return NextResponse.json(events);
}
