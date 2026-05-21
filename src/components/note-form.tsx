import { createNote } from "@/app/actions";

const colorOptions = [
  { value: "plain", label: "白", className: "bg-white" },
  { value: "amber", label: "黄", className: "bg-amber" },
  { value: "mint", label: "緑", className: "bg-mint" },
  { value: "rose", label: "赤", className: "bg-rose" },
  { value: "sky", label: "青", className: "bg-sky" }
];

export function NoteForm() {
  return (
    <form action={createNote} className="rounded-lg border border-line bg-white p-4 shadow-note">
      <input
        name="title"
        className="w-full border-0 bg-transparent text-lg font-semibold outline-none placeholder:text-ink/35"
        placeholder="タイトル"
      />
      <textarea
        name="content"
        rows={3}
        className="mt-2 w-full border-0 bg-transparent text-sm leading-6 outline-none placeholder:text-ink/35"
        placeholder="メモを入力"
      />
      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-xs font-semibold text-ink/65">
            期限
            <input
              type="datetime-local"
              name="due_at"
              className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </label>
          <fieldset>
            <legend className="text-xs font-semibold text-ink/65">色</legend>
            <div className="mt-1 flex gap-2">
              {colorOptions.map((option) => (
                <label key={option.value} className="relative">
                  <input
                    type="radio"
                    name="color"
                    value={option.value}
                    defaultChecked={option.value === "plain"}
                    className="peer sr-only"
                  />
                  <span
                    className={`block h-8 w-8 rounded-full border border-line ${option.className} peer-checked:ring-2 peer-checked:ring-accent`}
                    title={option.label}
                  />
                </label>
              ))}
            </div>
          </fieldset>
        </div>
        <div className="flex items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-sm text-ink/75">
            <input type="checkbox" name="is_pinned" className="h-4 w-4 accent-accent" />
            固定
          </label>
          <button className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white">
            追加
          </button>
        </div>
      </div>
    </form>
  );
}
