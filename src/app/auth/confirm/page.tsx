import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { confirmLoginLink } from "@/app/auth/confirm/actions";

type ConfirmPageProps = {
  searchParams?: {
    token_hash?: string;
    type?: string;
    next?: string;
    error?: string;
  };
};

function message(error?: string) {
  if (error === "invalid-link") {
    return "ログインリンクの形式が正しくありません。ログイン画面から新しいリンクを送信してください。";
  }

  if (error === "verify-failed") {
    return "ログインリンクを検証できませんでした。期限切れ、または使用済みの可能性があります。";
  }

  return null;
}

export default async function ConfirmPage({ searchParams }: ConfirmPageProps) {
  const user = await getCurrentUser();

  if (user) {
    redirect("/");
  }

  const errorMessage = message(searchParams?.error);
  const hasToken = Boolean(searchParams?.token_hash && searchParams?.type);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-10">
      <div className="mb-8">
        <p className="text-sm font-semibold text-accent">FastKeep</p>
        <h1 className="mt-2 text-3xl font-bold tracking-normal text-ink">ログインを完了します。</h1>
        <p className="mt-3 text-sm leading-6 text-ink/70">
          メールリンクを開きました。下のボタンで FastKeep へのログインを確定してください。
        </p>
      </div>
      <div className="rounded-lg border border-line bg-white p-5 shadow-note">
        {errorMessage ? (
          <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMessage}
          </p>
        ) : null}
        {hasToken ? (
          <form action={confirmLoginLink}>
            <input type="hidden" name="token_hash" value={searchParams?.token_hash} />
            <input type="hidden" name="type" value={searchParams?.type} />
            <input type="hidden" name="next" value={searchParams?.next || "/"} />
            <button className="w-full rounded-md bg-accent px-4 py-2 font-semibold text-white">
              ログインを完了する
            </button>
          </form>
        ) : (
          <a
            href="/login"
            className="block rounded-md bg-accent px-4 py-2 text-center font-semibold text-white"
          >
            ログイン画面へ戻る
          </a>
        )}
      </div>
    </main>
  );
}
