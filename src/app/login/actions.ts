"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function loginUrl(params: Record<string, string>) {
  const searchParams = new URLSearchParams(params);
  return `/login?${searchParams.toString()}`;
}

export async function sendLoginLink(formData: FormData) {
  const email = formData.get("email");

  if (typeof email !== "string" || !email.includes("@")) {
    redirect(loginUrl({ error: "invalid-email" }));
  }

  const origin = headers().get("origin") ?? "http://localhost:3000";
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback`
    }
  });

  if (error) {
    redirect(loginUrl({ error: "send-failed" }));
  }

  redirect(loginUrl({ sent: "1" }));
}
