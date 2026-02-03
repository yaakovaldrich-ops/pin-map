import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const [pinsRes, viewsRes] = await Promise.all([
    supabase.from("pins").select("*"),
    supabase.from("page_views").select("*"),
  ]);

  if (pinsRes.error || viewsRes.error) {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }

  const pins = pinsRes.data || [];
  const views = viewsRes.data || [];
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  const uniqueVisitors = new Set(views.map((v) => v.visitor_hash));
  const todayViews = views.filter((v) => v.timestamp?.startsWith(todayStr));
  const todayVisitors = new Set(todayViews.map((v) => v.visitor_hash));
  const todayPins = pins.filter((p) => p.created_at?.startsWith(todayStr));

  // Pins by category
  const catMap: Record<string, number> = {};
  for (const p of pins) {
    catMap[p.category] = (catMap[p.category] || 0) + 1;
  }
  const pins_by_category = Object.entries(catMap).map(([category, count]) => ({ category, count }));

  // Views per day (last 7 days)
  const recent_views: { date: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const count = views.filter((v) => v.timestamp?.startsWith(dateStr)).length;
    recent_views.push({ date: dateStr, count });
  }

  return NextResponse.json({
    total_pins: pins.length,
    total_visitors: uniqueVisitors.size,
    pins_today: todayPins.length,
    visitors_today: todayVisitors.size,
    pins_by_category,
    recent_views,
  });
}

export async function POST(req: NextRequest) {
  const { path, visitor_hash } = await req.json();

  await supabase.from("page_views").insert([{ path, visitor_hash }]);

  return NextResponse.json({ success: true });
}
