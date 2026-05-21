"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type EmailOtpType = "email" | "magiclink" | "signup" | "recovery" | "invite" | "email_change";

function confirmUrl(params: Record<string, string>) {
  const searchParams = new URLSearchParams(params);
  return `/auth/confirm?${searchParams.toString()}`;
}

function isEmailOtpType(type: string): type is EmailOtpType {
  return ["email", "magiclink", "signup", "recovery", "invite", "email_change"].includes(type);
}

function logConfirmError(error: unknown) {
  if (error instanceof Error) {
    console.error("[FastKeep] ログインリンク検証に失敗しました", {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    return;
  }

  console.error("[FastKeep] ログインリンク検証に失敗しました", { error });
}

export async function confirmLoginLink(formData: FormData) {
  const tokenHash = formData.get("token_hash");
  const type = formData.get("type");
  const next = formData.get("next");

  if (typeof tokenHash !== "string" || typeof type !== "string" || !isEmailOtpType(type)) {
    redirect(confirmUrl({ error: "invalid-link" }));
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth
    .verifyOtp({
      token_hash: tokenHash,
      type
    })
    .catch((caughtError: unknown) => {
      logConfirmError(caughtError);
      return { error: caughtError };
    });

  if (error) {
    logConfirmError(error);
    redirect(confirmUrl({ error: "verify-failed" }));
  }

  redirect(typeof next === "string" && next.startsWith("/") ? next : "/");
}
