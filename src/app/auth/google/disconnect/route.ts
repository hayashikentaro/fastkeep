import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
  }

  const admin = createSupabaseAdminClient();
  await admin.from("google_connections").delete().eq("user_id", user.id);
  await admin
    .from("notes")
    .update({
      calendar_event_id: null,
      calendar_projection_status: "none",
      calendar_projection_error: null,
      updated_at: new Date().toISOString()
    })
    .eq("user_id", user.id);

  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}
