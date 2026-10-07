"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "./AuthProvider";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { initials } from "@/lib/format";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/problems", label: "Problems" },
  { href: "/dashboard/frontend", label: "Great Front End" },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4">
        <div className="flex items-center gap-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-semibold tracking-tight"
          >
            <Logo className="h-7 w-7" />
            <span className="hidden sm:inline">
              LeetCode <span className="text-brand">&amp; Great Front End</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                prefetch={true}
                className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                  isActive(link.href)
                    ? "bg-surface-2 text-foreground"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="hidden items-center gap-2 sm:flex">
            <span
              className="grid h-8 w-8 place-items-center rounded-full text-xs font-semibold text-black"
              style={{ background: user.color }}
            >
              {initials(user.name)}
            </span>
            <div className="leading-tight">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted">@{user.username}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void logout()}
            className="hidden rounded-md border border-border px-3 py-1.5 text-sm text-muted transition-colors hover:border-foreground/20 hover:text-foreground sm:inline"
          >
            Sign out
          </button>
          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-md border border-border md:hidden"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">Menu</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <rect y="2" width="16" height="2" rx="1" />
              <rect y="7" width="16" height="2" rx="1" />
              <rect y="12" width="16" height="2" rx="1" />
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                prefetch={true}
                onClick={() => setOpen(false)}
                className={`rounded-md px-3 py-2 text-sm ${
                  isActive(link.href) ? "bg-surface-2" : "text-muted"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3">
            <div className="flex items-center gap-2">
              <span
                className="grid h-8 w-8 place-items-center rounded-full text-xs font-semibold text-black"
                style={{ background: user.color }}
              >
                {initials(user.name)}
              </span>
              <span className="text-sm">{user.name}</span>
            </div>
            <button
              type="button"
              onClick={() => void logout()}
              className="text-sm text-muted"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
