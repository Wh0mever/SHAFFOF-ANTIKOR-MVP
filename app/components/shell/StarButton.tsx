"use client";

import { Star } from "lucide-react";
import { useWatchlist, type WatchKind } from "@/lib/watchlist";
import { cn } from "@/lib/utils";

export function StarButton({
  kind,
  id,
  label,
  size = 14,
  className,
}: {
  kind: WatchKind;
  id: string;
  label: string;
  size?: number;
  className?: string;
}) {
  const { has, toggle } = useWatchlist();
  const active = has(kind, id);
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        toggle(kind, id, label);
      }}
      aria-label={active ? "Удалить из watchlist" : "Добавить в watchlist"}
      title={active ? "В watchlist" : "Следить"}
      className={cn(
        "rounded-md p-1 transition",
        active
          ? "text-amber-400 hover:bg-amber-500/10"
          : "text-zinc-600 hover:bg-zinc-800 hover:text-zinc-300",
        className
      )}
    >
      <Star className={active ? "fill-amber-400" : ""} style={{ width: size, height: size }} />
    </button>
  );
}
