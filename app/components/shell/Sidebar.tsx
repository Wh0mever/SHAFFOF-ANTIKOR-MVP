"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  FileText,
  Bell,
  Map as MapIcon,
  Network,
  Star,
  Settings as SettingsIcon,
  ChevronLeft,
  ChevronRight,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWatchlist } from "@/lib/watchlist";

type NavItem = { href: string; label: string; icon: React.ComponentType<{ className?: string }> };

const NAV: NavItem[] = [
  { href: "/", label: "Дашборд", icon: LayoutDashboard },
  { href: "/tenders", label: "Тендеры", icon: FileText },
  { href: "/alerts", label: "Алерты", icon: Bell },
  { href: "/map", label: "Карта", icon: MapIcon },
  { href: "/connections", label: "Связи", icon: Network },
  { href: "/watchlist", label: "Watchlist", icon: Star },
  { href: "/settings", label: "Настройки", icon: SettingsIcon },
];

export function Sidebar({ unreadAlerts = 0 }: { unreadAlerts?: number }) {
  const { items: watchlist } = useWatchlist();
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "relative h-screen shrink-0 border-r border-zinc-800/80 bg-zinc-950 transition-all duration-200",
        collapsed ? "w-[72px]" : "w-[240px]"
      )}
    >
      <div className="flex items-center gap-3 px-5 pt-5 pb-7">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30">
          <Shield className="h-5 w-5" />
        </div>
        {!collapsed && (
          <div className="leading-tight">
            <div className="text-sm font-bold tracking-wide text-zinc-100">SHAFFOF AI</div>
            <div className="text-[10px] uppercase tracking-wider text-zinc-500">антикоррупция</div>
          </div>
        )}
      </div>

      <nav className="px-3 space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          const badge =
            label === "Алерты" ? unreadAlerts : label === "Watchlist" ? watchlist.length : 0;
          const badgeColor = label === "Watchlist" ? "bg-amber-500/90" : "bg-rose-500/90";
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
              )}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
              {!collapsed && badge > 0 && (
                <span className={`ml-auto inline-flex h-5 min-w-[22px] items-center justify-center rounded-full ${badgeColor} px-1.5 text-[10px] font-bold text-white`}>
                  {badge > 99 ? "99+" : badge}
                </span>
              )}
              {collapsed && badge > 0 && (
                <span className={`absolute right-1 top-1 h-2 w-2 rounded-full ${badgeColor}`} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer: developer credit + collapse toggle */}
      <div className="absolute bottom-3 left-3 right-3 space-y-2">
        {!collapsed && (
          <a
            href="https://whomever.uz"
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-lg border border-zinc-800/80 bg-zinc-900/40 px-3 py-2 text-center transition hover:border-emerald-500/30 hover:bg-zinc-900"
          >
            <div className="text-[9px] uppercase tracking-wider text-zinc-600">
              Разработчики
            </div>
            <div className="mt-0.5 text-[11px] font-bold tracking-wide text-emerald-400 group-hover:text-emerald-300">
              OOO WHOMEVER
            </div>
            <div className="text-[9px] text-zinc-500">whomever.uz ↗</div>
          </a>
        )}
        {collapsed && (
          <a
            href="https://whomever.uz"
            target="_blank"
            rel="noopener noreferrer"
            title="OOO WHOMEVER · whomever.uz"
            className="block rounded-lg border border-zinc-800/80 bg-zinc-900/40 py-2 text-center text-[10px] font-bold text-emerald-400 hover:border-emerald-500/30"
          >
            W
          </a>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="flex w-full items-center justify-center rounded-lg border border-zinc-800/80 py-2 text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300"
          aria-label="toggle sidebar"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  );
}
