import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { exchangeCodeForTokens, expiresAt } from "@/lib/google-calendar";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const state = requestUrl.searchParams.get("state");
  const storedState = request.cookies.get("fastkeep_google_oauth_state")?.value;
  const redirectUrl = new URL("/", request.url);

  if (!code || !state || state !== storedState) {
    redirectUrl.searchParams.set("error", "google-oauth");
    return NextResponse.redirect(redirectUrl);
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const token = await exchangeCodeForTokens(code);
  const admin = createSupabaseAdminClient();
  const { data: existing } = await admin
    .from("google_connections")
    .select()
    .eq("user_id", user.id)
    .maybeSingle();

  await admin.from("google_connections").upsert({
    user_id: user.id,
    access_token: token.access_token,
    refresh_token: token.refresh_token || existing?.refresh_token || null,
    expires_at: expiresAt(token.expires_in),
    scope: token.scope || null,
    updated_at: new Date().toISOString()
  });

  const response = NextResponse.redirect(redirectUrl);
  response.cookies.delete("fastkeep_google_oauth_state");

  return response;
}
