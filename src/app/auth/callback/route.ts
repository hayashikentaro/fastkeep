import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/";
  const error = requestUrl.searchParams.get("error");
  const errorCode = requestUrl.searchParams.get("error_code");
  const errorDescription = requestUrl.searchParams.get("error_description");

  if (error || errorCode || errorDescription) {
    console.error("[FastKeep] Supabase Auth コールバックでエラーを受け取りました", {
      error,
      errorCode,
      errorDescription
    });
    return NextResponse.redirect(new URL("/login?error=auth-callback", requestUrl.origin));
  }

  if (code) {
    const supabase = createSupabaseServerClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) {
      console.error("[FastKeep] Supabase Auth コード交換に失敗しました", {
        name: exchangeError.name,
        message: exchangeError.message,
        status: exchangeError.status,
        code: exchangeError.code
      });
      return NextResponse.redirect(new URL("/login?error=auth-callback", requestUrl.origin));
    }
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
