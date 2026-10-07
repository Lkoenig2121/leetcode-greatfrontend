"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { PublicUser } from "@/lib/types";
import { Logo } from "./Logo";
import { initials } from "@/lib/format";

export function LoginScreen() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<PublicUser[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .me()
      .then(() => {
        if (!cancelled) router.replace("/dashboard");
      })
      .catch(() => {
        /* not signed in */
      });
    api.users().then((users) => {
      if (!cancelled) setAccounts(users);
    });
    return () => {
      cancelled = true;
    };
  }, [router]);

  const pick = async (userId: string) => {
    setBusy(userId);
    setError(null);
    try {
      await api.login(userId);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in");
      setBusy(null);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,161,22,0.12),_transparent_55%)]" />
      <header className="relative z-10 flex items-center gap-2 px-6 py-5">
        <Logo />
        <span className="text-lg font-semibold tracking-tight">
          LeetCode <span className="text-brand">&amp; Great Front End</span>
        </span>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center px-4 pb-16">
        <div className="mb-10 max-w-xl animate-fade-in">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-brand">
            Practice arena
          </p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Choose an account to start solving.
          </h1>
          <p className="mt-4 text-muted">
            Three demo profiles, each with different progress already on the
            board. Pick one — no password needed.
          </p>
        </div>

        {error && (
          <p className="mb-4 rounded-md border border-wrong/40 bg-wrong/10 px-3 py-2 text-sm text-wrong">
            {error}
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          {accounts.map((account, i) => (
            <button
              key={account.id}
              type="button"
              onClick={() => void pick(account.id)}
              disabled={busy !== null}
              style={{ animationDelay: `${i * 80}ms` }}
              className="animate-fade-in group flex flex-col items-start rounded-2xl border border-border bg-surface p-5 text-left transition hover:border-brand/60 hover:bg-surface-2 disabled:opacity-60"
            >
              <span
                className="mb-4 grid h-12 w-12 place-items-center rounded-full text-sm font-bold text-black"
                style={{ background: account.color }}
              >
                {initials(account.name)}
              </span>
              <span className="text-lg font-semibold">{account.name}</span>
              <span className="text-sm text-muted">@{account.username}</span>
              <span className="mt-3 rounded-full bg-background px-2.5 py-1 text-xs text-foreground/80">
                {account.title}
              </span>
              <span className="mt-6 text-sm font-medium text-brand group-hover:underline">
                {busy === account.id ? "Signing in…" : "Continue →"}
              </span>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
