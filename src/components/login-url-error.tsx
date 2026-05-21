"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

function messageFromHash(hash: string) {
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  const code = params.get("error_code");
  const description = params.get("error_description");

  if (code === "otp_expired") {
    return "ログインリンクが期限切れ、またはすでに使用済みです。新しいリンクを送信してください。";
  }

  if (description) {
    return `ログインできませんでした。${description}`;
  }

  return null;
}

export function LoginUrlError() {
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    function handleHash() {
      const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");

      if (accessToken && refreshToken) {
        setMessage("ログイン処理中です。");
        createSupabaseBrowserClient()
          .auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })
          .then(({ error }) => {
            if (error) {
              setMessage("ログインセッションを保存できませんでした。新しいリンクを送信してください。");
              return;
            }

            window.history.replaceState(null, "", "/login");
            router.replace("/");
          });
        return;
      }

      setMessage(messageFromHash(window.location.hash));
    }

    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, [router]);

  if (!message) {
    return null;
  }

  return (
    <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
      {message}
    </p>
  );
}
