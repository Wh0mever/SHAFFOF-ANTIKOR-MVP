"use client";

import { useEffect, useState } from "react";
import { Activity, Database } from "lucide-react";

type Mode = "LIVE" | "DEMO";

const KEY = "shaffof.mode";

export function getMode(): Mode {
  if (typeof window === "undefined") return "LIVE";
  return (localStorage.getItem(KEY) as Mode) || "LIVE";
}

export function setMode(m: Mode) {
  localStorage.setItem(KEY, m);
  document.cookie = `shaffof_mode=${m}; path=/; max-age=31536000`;
  window.dispatchEvent(new CustomEvent("shaffof:mode", { detail: m }));
}

export function useMode(): [Mode, (m: Mode) => void] {
  const [mode, setLocal] = useState<Mode>("LIVE");
  useEffect(() => {
    setLocal(getMode());
    const h = (e: Event) => setLocal((e as CustomEvent).detail as Mode);
    window.addEventListener("shaffof:mode", h);
    return () => window.removeEventListener("shaffof:mode", h);
  }, []);
  return [mode, (m: Mode) => { setMode(m); setLocal(m); }];
}

export function TopBar({ title, subtitle }: { title: string; subtitle?: string }) {
  const [mode, setM] = useMode();

  return (
    <div className="flex items-center justify-between border-b border-zinc-800/80 bg-zinc-950/60 px-8 py-5 backdrop-blur">
      <div className="min-w-0">
        <h1 className="truncate text-2xl font-bold tracking-tight text-zinc-100">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-zinc-500">{subtitle}</p>}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <ModeToggle mode={mode} onChange={setM} />
      </div>
    </div>
  );
}

function ModeToggle({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  return (
    <div className="flex items-center gap-1 rounded-full border border-zinc-800 bg-zinc-900/60 p-1">
      <button
        onClick={() => onChange("LIVE")}
        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
          mode === "LIVE"
            ? "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/40"
            : "text-zinc-500 hover:text-zinc-300"
        }`}
      >
        <span className={`relative flex h-2 w-2`}>
          {mode === "LIVE" && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          )}
          <span className={`relative inline-flex h-2 w-2 rounded-full ${mode === "LIVE" ? "bg-emerald-400" : "bg-zinc-600"}`} />
        </span>
        <Activity className="h-3 w-3" />
        LIVE
      </button>
      <button
        onClick={() => onChange("DEMO")}
        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
          mode === "DEMO"
            ? "bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/40"
            : "text-zinc-500 hover:text-zinc-300"
        }`}
      >
        <Database className="h-3 w-3" />
        DEMO
      </button>
    </div>
  );
}
