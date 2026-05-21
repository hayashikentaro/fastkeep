import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { serverEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET() {
  if (process.env.NODE_ENV === "production" && process.env.ENABLE_RUNTIME_SMOKE !== "1") {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  serverEnv();

  if (process.env.RUN_SUPABASE_SMOKE === "1") {
    const admin = createSupabaseAdminClient();
    const { error } = await admin.from("notes").select("id").limit(1);

    if (error) {
      console.error("[FastKeep] Supabase runtime smoke に失敗しました", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });

      return NextResponse.json(
        {
          ok: false,
          check: "supabase",
          message: error.message
        },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({
    ok: true,
    checks: {
      env: true,
      supabase: process.env.RUN_SUPABASE_SMOKE === "1"
    }
  });
}
