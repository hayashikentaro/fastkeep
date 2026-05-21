"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function loginUrl(params: Record<string, string>) {
  const searchParams = new URLSearchParams(params);
  return `/login?${searchParams.toString()}`;
}

function maskEmail(email: string) {
  const [localPart, domain] = email.split("@");
  if (!localPart || !domain) {
    return "不明なメールアドレス";
  }

  return `${localPart.slice(0, 2)}***@${domain}`;
}

function logLoginLinkError(email: string, error: unknown) {
  if (error instanceof Error) {
    console.error("[FastKeep] ログインリンク送信に失敗しました", {
      email: maskEmail(email),
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    return;
  }

  console.error("[FastKeep] ログインリンク送信に失敗しました", {
    email: maskEmail(email),
    error
  });
}

export async function sendLoginLink(formData: FormData) {
  const email = formData.get("email");

  if (typeof email !== "string" || !email.includes("@")) {
    redirect(loginUrl({ error: "invalid-email" }));
  }

  const origin = headers().get("origin") ?? "http://localhost:3000";
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth
    .signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${origin}/auth/callback`
      }
    })
    .catch((caughtError: unknown) => {
      logLoginLinkError(email, caughtError);
      return { error: caughtError };
    });

  if (error) {
    logLoginLinkError(email, error);
    redirect(loginUrl({ error: "send-failed" }));
  }

  redirect(loginUrl({ sent: "1" }));
}
