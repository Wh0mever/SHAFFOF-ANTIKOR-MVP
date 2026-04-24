import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SHAFFOF · Live watchdog",
  description: "Real-time watchdog for Uzbek government procurement.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz" className="dark">
      <body className="bg-black text-zinc-100 antialiased">{children}</body>
    </html>
  );
}
