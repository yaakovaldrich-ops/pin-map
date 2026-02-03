import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const { data, error } = await supabase
    .from("site_config")
    .select("*")
    .limit(1)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, site_name, theme, legend } = body;

  const updates: Record<string, unknown> = {};
  if (site_name !== undefined) updates.site_name = site_name;
  if (theme !== undefined) updates.theme = theme;
  if (legend !== undefined) updates.legend = legend;

  const { data, error } = await supabase
    .from("site_config")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
