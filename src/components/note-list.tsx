import { archiveNote, deleteNote, updateNote } from "@/app/actions";
import type { Note, NoteColor, ProjectionStatus } from "@/lib/types";

const noteColorClass: Record<NoteColor, string> = {
  plain: "bg-white",
  amber: "bg-amber",
  mint: "bg-mint",
  rose: "bg-rose",
  sky: "bg-sky"
};

const colorOptions: Array<{ value: NoteColor; label: string }> = [
  { value: "plain", label: "白" },
  { value: "amber", label: "黄" },
  { value: "mint", label: "緑" },
  { value: "rose", label: "赤" },
  { value: "sky", label: "青" }
];

const projectionLabel: Record<ProjectionStatus, string> = {
  none: "未投影",
  synced: "同期済み",
  error: "要確認"
};

function toDateTimeLocal(value: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return offsetDate.toISOString().slice(0, 16);
}

function formatDueAt(value: string | null) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function NoteList({ notes }: { notes: Note[] }) {
  if (notes.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-line px-5 py-10 text-center text-sm text-ink/60">
        まだメモがありません。最初のメモを追加してください。
      </div>
    );
  }

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {notes.map((note) => (
        <article
          key={note.id}
          className={`rounded-lg border border-line p-4 shadow-note ${noteColorClass[note.color]}`}
        >
          <details>
            <summary className="cursor-pointer list-none">
              <div className="flex items-start justify-between gap-3">
                <h2 className="break-words text-lg font-semibold text-ink">
                  {note.title || "無題のメモ"}
                </h2>
                {note.is_pinned ? (
                  <span className="rounded-full bg-ink px-2 py-1 text-xs font-semibold text-white">
                    固定
                  </span>
                ) : null}
              </div>
              {note.content ? (
                <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-ink/80">
                  {note.content}
                </p>
              ) : null}
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-ink/65">
                {note.due_at ? <span>{formatDueAt(note.due_at)}</span> : null}
                <span>{projectionLabel[note.calendar_projection_status]}</span>
                {note.is_archived ? <span>アーカイブ</span> : null}
              </div>
              {note.calendar_projection_error ? (
                <p className="mt-2 break-words text-xs text-red-700">
                  {note.calendar_projection_error}
                </p>
              ) : null}
            </summary>
            <form action={updateNote} className="mt-4 border-t border-ink/10 pt-4">
              <input type="hidden" name="id" value={note.id} />
              <label className="block text-xs font-semibold text-ink/65">
                タイトル
                <input
                  name="title"
                  defaultValue={note.title}
                  className="mt-1 w-full rounded-md border border-line bg-white/70 px-3 py-2 text-sm outline-none focus:border-accent"
                />
              </label>
              <label className="mt-3 block text-xs font-semibold text-ink/65">
                本文
                <textarea
                  name="content"
                  defaultValue={note.content}
                  rows={4}
                  className="mt-1 w-full rounded-md border border-line bg-white/70 px-3 py-2 text-sm leading-6 outline-none focus:border-accent"
                />
              </label>
              <div className="mt-3 grid gap-3">
                <label className="block text-xs font-semibold text-ink/65">
                  期限
                  <input
                    type="datetime-local"
                    name="due_at"
                    defaultValue={toDateTimeLocal(note.due_at)}
                    className="mt-1 w-full rounded-md border border-line bg-white/70 px-3 py-2 text-sm outline-none focus:border-accent"
                  />
                </label>
                <fieldset>
                  <legend className="text-xs font-semibold text-ink/65">色</legend>
                  <div className="mt-1 flex gap-2">
                    {colorOptions.map((option) => (
                      <label key={option.value} className="flex items-center gap-1 text-xs">
                        <input
                          type="radio"
                          name="color"
                          value={option.value}
                          defaultChecked={note.color === option.value}
                          className="accent-accent"
                        />
                        {option.label}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <label className="flex items-center gap-2 text-sm text-ink/75">
                  <input
                    type="checkbox"
                    name="is_pinned"
                    defaultChecked={note.is_pinned}
                    className="h-4 w-4 accent-accent"
                  />
                  固定
                </label>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button className="rounded-md bg-accent px-3 py-2 text-sm font-semibold text-white">
                  保存
                </button>
                <button
                  formAction={archiveNote}
                  className="rounded-md border border-line bg-white/80 px-3 py-2 text-sm font-semibold text-ink"
                >
                  {note.is_archived ? "戻す" : "アーカイブ"}
                </button>
                <button
                  formAction={deleteNote}
                  className="rounded-md border border-red-200 bg-white/80 px-3 py-2 text-sm font-semibold text-red-700"
                >
                  削除
                </button>
              </div>
            </form>
          </details>
        </article>
      ))}
    </section>
  );
}
