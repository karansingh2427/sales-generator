import { Lock } from "lucide-react";

export const metadata = { title: "Sales Generator — demo" };

export default async function UnlockPage({ searchParams }: PageProps<"/unlock">) {
  const { next, error } = await searchParams;
  const target = typeof next === "string" && next.startsWith("/") ? next : "/campaign";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(120%_80%_at_50%_0%,#ecfdf5_0%,#f8fafc_60%)] px-4">
      <form
        action="/api/unlock"
        method="post"
        className="w-full max-w-sm space-y-5 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm"
      >
        <div className="space-y-2">
          <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
            <Lock className="size-5" />
          </span>
          <h1 className="text-xl font-semibold text-slate-900">Sales Generator demo</h1>
          <p className="text-sm text-slate-500">
            Willow outreach agent — sample data only. Enter the password you were sent.
          </p>
        </div>
        <input type="hidden" name="next" value={target} />
        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoFocus
            required
            autoComplete="current-password"
            className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-3 focus:ring-emerald-500/20"
          />
          {error && <p className="text-sm text-red-600">That password didn’t work — try again.</p>}
        </div>
        <button
          type="submit"
          className="h-10 w-full rounded-lg bg-emerald-600 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Open the demo
        </button>
      </form>
    </main>
  );
}
