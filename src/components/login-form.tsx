"use client";

import { useState, useTransition } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function submit() {
    setMessage("");
    startTransition(async () => {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      setMessage(error ? error.message : "ログイン用リンクをメールで送信しました。");
    });
  }

  return (
    <div className="rounded-lg border border-line bg-white p-5 shadow-note">
      <label className="block text-sm font-medium text-ink" htmlFor="email">
        メールアドレス
      </label>
      <input
        id="email"
        type="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        className="mt-2 w-full rounded-md border border-line bg-paper px-3 py-2 outline-none focus:border-accent"
        placeholder="you@example.com"
      />
      <button
        type="button"
        onClick={submit}
        disabled={isPending || !email}
        className="mt-4 w-full rounded-md bg-accent px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "送信中..." : "ログインリンクを送る"}
      </button>
      {message ? <p className="mt-3 text-sm text-ink/70">{message}</p> : null}
    </div>
  );
}
