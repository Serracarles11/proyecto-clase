import { NextResponse } from "next/server";
import { createClient } from "@/backend/utils/supabase/client";

export async function GET() {
  const supabase = createClient();

  const { data, error } = await supabase.rpc("fn_get_reuniones");

  if (error) return NextResponse.json({ error }, { status: 500 });

  return NextResponse.json(data);
}
