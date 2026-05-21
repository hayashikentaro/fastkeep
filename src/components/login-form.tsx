import { sendLoginLink } from "@/app/login/actions";

export function LoginForm({ message }: { message?: string }) {
  return (
    <form action={sendLoginLink} className="rounded-lg border border-line bg-white p-5 shadow-note">
      <label className="block text-sm font-medium text-ink" htmlFor="email">
        メールアドレス
      </label>
      <input
        id="email"
        name="email"
        type="email"
        required
        className="mt-2 w-full rounded-md border border-line bg-paper px-3 py-2 outline-none focus:border-accent"
        placeholder="you@example.com"
      />
      <button
        type="submit"
        className="mt-4 w-full rounded-md bg-accent px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        ログインリンクを送る
      </button>
      {message ? <p className="mt-3 text-sm text-ink/70">{message}</p> : null}
    </form>
  );
}
