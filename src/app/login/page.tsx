import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "@/components/login-form";
import { LoginUrlError } from "@/components/login-url-error";

type LoginPageProps = {
  searchParams?: {
    sent?: string;
    error?: string;
  };
};

function loginMessage(searchParams?: LoginPageProps["searchParams"]) {
  if (searchParams?.sent === "1") {
    return "ログイン用リンクをメールで送信しました。";
  }

  if (searchParams?.error === "invalid-email") {
    return "有効なメールアドレスを入力してください。";
  }

  if (searchParams?.error === "send-failed") {
    return "ログインリンクを送信できませんでした。Supabase Auth の設定を確認してください。";
  }

  return undefined;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const user = await getCurrentUser();

  if (user) {
    redirect("/");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-10">
      <div className="mb-8">
        <p className="text-sm font-semibold text-accent">FastKeep</p>
        <h1 className="mt-2 text-3xl font-bold tracking-normal text-ink">すばやく残して、必要な時刻へ。</h1>
        <p className="mt-3 text-sm leading-6 text-ink/70">
          メモは FastKeep に保存され、期限があるものだけ Google Calendar に予定として投影されます。
        </p>
      </div>
      <LoginUrlError />
      <LoginForm message={loginMessage(searchParams)} />
    </main>
  );
}
