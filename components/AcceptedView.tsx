"use client";

import { useEffect, useMemo, useState } from "react";

const CONFETTI_COLORS = ["#2cbb5d", "#ffa116", "#00b8a3", "#ffc01e", "#64d88b", "#ffffff"];

function useCountUp(target: number, duration = 900, delay = 0): number {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(0);
    let raf = 0;
    const begin = performance.now() + delay;
    const tick = (now: number) => {
      if (now < begin) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const t = Math.min(1, (now - begin) / duration);
      const eased = 1 - (1 - t) ** 3;
      setN(target * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
      else setN(target);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, delay]);
  return n;
}

function beatsPercent(runtimeMs: number, id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  const speed = Math.max(8, Math.min(97, 94 - runtimeMs / 6));
  const jitter = (hash % 173) / 20;
  return Math.min(99.86, speed + (jitter % 4.5));
}

function Confetti({ burst }: { burst: boolean }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: burst ? 36 : 22 }, (_, i) => ({
        id: i,
        left: 8 + ((i * 17) % 84),
        delay: (i % 8) * 0.03,
        duration: 0.85 + (i % 5) * 0.12,
        dx: ((i * 47) % 180) - 90,
        rot: (i * 73) % 420,
        size: 4 + (i % 5),
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        round: i % 3 === 0,
      })),
    [burst],
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {pieces.map((p) => (
        <span
          key={p.id}
          className="accept-confetti"
          style={{
            left: `${p.left}%`,
            top: "28%",
            width: p.size,
            height: p.round ? p.size : p.size * 1.6,
            background: p.color,
            borderRadius: p.round ? "50%" : 1,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            ["--dx" as string]: `${p.dx}px`,
            ["--rot" as string]: `${p.rot}deg`,
          }}
        />
      ))}
    </div>
  );
}

function FillBar({ percent, className = "" }: { percent: number; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-full bg-accept-track ${className}`}>
      <div
        className="h-full rounded-full bg-accepted"
        style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
      />
    </div>
  );
}

export function AcceptedView({
  passed,
  total,
  runtimeMs,
  newlySolved,
  submissionId,
}: {
  passed: number;
  total: number;
  runtimeMs: number;
  newlySolved?: boolean;
  submissionId: string;
}) {
  const beatsTarget = useMemo(() => beatsPercent(runtimeMs, submissionId), [runtimeMs, submissionId]);
  const passedNow = useCountUp(passed, 900, 120);
  const runtimeNow = useCountUp(runtimeMs, 900, 180);
  const beatsNow = useCountUp(beatsTarget, 1100, 260);
  const barPercent = total > 0 ? (passedNow / total) * 100 : 0;

  return (
    <div key={submissionId} className="relative accept-stage overflow-hidden rounded-lg px-1 pb-1">
      <Confetti burst={!!newlySolved} />
      <div className="relative flex items-center gap-3 pt-1">
        <div className="accept-mark-wrap">
          <svg viewBox="0 0 52 52" className="h-12 w-12 accept-mark" aria-hidden>
            <circle className="accept-ring" cx="26" cy="26" r="22" fill="none" />
            <path className="accept-check" d="M16 26.5 l7.5 7.5 13-15" fill="none" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="accept-title text-2xl font-semibold tracking-tight text-accepted">Accepted</p>
          {newlySolved && (
            <p className="accept-first mt-0.5 text-xs font-medium text-brand">First accepted submission — marked solved</p>
          )}
        </div>
      </div>

      <div className="relative mt-4">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="text-muted">Testcases passed</span>
          <span className="font-medium tabular-nums text-accepted">
            {Math.round(passedNow)}/{total}
          </span>
        </div>
        <FillBar percent={barPercent} className="h-2.5 w-full" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-accepted/20 bg-accepted/8 px-3 py-2">
          <p className="text-[11px] uppercase tracking-wide text-muted">Runtime</p>
          <p className="mt-0.5 text-lg font-semibold tabular-nums">{Math.round(runtimeNow)} ms</p>
          <FillBar percent={runtimeMs ? (runtimeNow / runtimeMs) * 100 : 0} className="mt-2 h-1.5 w-full" />
        </div>
        <div className="rounded-lg border border-accepted/20 bg-accepted/8 px-3 py-2">
          <p className="text-[11px] uppercase tracking-wide text-muted">Beats</p>
          <p className="mt-0.5 text-lg font-semibold tabular-nums text-accepted">{beatsNow.toFixed(2)}%</p>
          <FillBar percent={beatsNow} className="mt-2 h-1.5 w-full" />
        </div>
      </div>
    </div>
  );
}

export function MiniAccepted({
  label,
  passed,
  total,
}: {
  label: string;
  passed: number;
  total: number;
}) {
  const passedNow = useCountUp(passed, 800, 80);
  const barPercent = total > 0 ? (passedNow / total) * 100 : 0;
  return (
    <div className="relative accept-stage overflow-hidden">
      <Confetti burst={false} />
      <div className="relative flex items-center gap-2.5">
        <svg viewBox="0 0 52 52" className="h-8 w-8 accept-mark" aria-hidden>
          <circle className="accept-ring" cx="26" cy="26" r="22" fill="none" />
          <path className="accept-check" d="M16 26.5 l7.5 7.5 13-15" fill="none" />
        </svg>
        <div className="min-w-0 flex-1">
          <p className="accept-title text-xl font-semibold text-accepted">Accepted</p>
          <p className="text-xs text-muted">{label}</p>
        </div>
        <span className="shrink-0 text-sm font-medium tabular-nums text-accepted">
          {Math.round(passedNow)}/{total}
        </span>
      </div>
      <FillBar percent={barPercent} className="relative mt-3 h-2 w-full" />
    </div>
  );
}
