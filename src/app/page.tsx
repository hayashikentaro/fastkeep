import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { NoteForm } from "@/components/note-form";
import { NoteList } from "@/components/note-list";

type HomeProps = {
  searchParams?: {
    archived?: string;
    error?: string;
  };
};

export default async function Home({ searchParams }: HomeProps) {
  const user = await requireUser();
  const showArchived = searchParams?.archived === "1";
  const admin = createSupabaseAdminClient();
  const [{ data: notes, error: notesError }, { data: googleConnection }] = await Promise.all([
    admin
      .from("notes")
      .select()
      .eq("user_id", user.id)
      .eq("is_archived", showArchived)
      .order("is_pinned", { ascending: false })
      .order("updated_at", { ascending: false }),
    admin.from("google_connections").select().eq("user_id", user.id).maybeSingle()
  ]);

  if (notesError) {
    throw new Error(notesError.message);
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 border-b border-line pb-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-accent">FastKeep</p>
          <h1 className="mt-1 text-3xl font-bold tracking-normal text-ink">メモ</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/70">
            FastKeep のデータベースを正として保存し、期限があるメモだけ Google Calendar に片方向で投影します。
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <form action="/auth/google/start" method="post">
            <button className="rounded-md bg-accent px-3 py-2 text-sm font-semibold text-white">
              {googleConnection ? "Google を再接続" : "Google Calendar 接続"}
            </button>
          </form>
          {googleConnection ? (
            <form action="/auth/google/disconnect" method="post">
              <button className="rounded-md border border-line bg-white px-3 py-2 text-sm font-semibold text-ink">
                Google 解除
              </button>
            </form>
          ) : null}
          <form action="/auth/signout" method="post">
            <button className="rounded-md border border-line bg-white px-3 py-2 text-sm font-semibold text-ink">
              ログアウト
            </button>
          </form>
        </div>
      </header>

      {searchParams?.error === "empty-note" ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          タイトルまたは本文を入力してください。
        </p>
      ) : null}

      <section className="mt-6">
        <NoteForm />
      </section>

      <nav className="mt-6 flex gap-2 text-sm">
        <Link
          href="/"
          className={`rounded-md px-3 py-2 font-semibold ${!showArchived ? "bg-ink text-white" : "border border-line bg-white text-ink"}`}
        >
          通常
        </Link>
        <Link
          href="/?archived=1"
          className={`rounded-md px-3 py-2 font-semibold ${showArchived ? "bg-ink text-white" : "border border-line bg-white text-ink"}`}
        >
          アーカイブ
        </Link>
      </nav>

      <div className="mt-4">
        <NoteList notes={notes ?? []} />
      </div>
    </main>
  );
}
