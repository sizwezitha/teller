import { NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const authHeader = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!authHeader) {
      return NextResponse.json({ user: null, plan: "free" }, { status: 200 });
    }

    return NextResponse.json({ user: null, plan: "free" }, { status: 200 });
  } catch (error) {
    console.error("Session lookup failed:", error);
    return NextResponse.json({ user: null, plan: "free" }, { status: 200 });
  }
}
