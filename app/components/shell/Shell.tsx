"use client";

import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { ChatWidget } from "./ChatWidget";
import { useLiveAlerts } from "@/lib/hooks";

export function Shell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const { alerts } = useLiveAlerts(15_000);
  const unread = alerts.length;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-black">
      <Sidebar unreadAlerts={unread} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar title={title} subtitle={subtitle} />
        <main className="flex-1 overflow-y-auto px-8 py-7">{children}</main>
      </div>
      <ChatWidget />
    </div>
  );
}
