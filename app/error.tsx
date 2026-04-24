"use client";

import { useEffect } from "react";
import { Button } from "./components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("app error:", error);
  }, [error]);

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-black text-center text-zinc-200">
      <div className="text-[10px] uppercase tracking-[0.4em] text-red-400">
        nimadir xato bo'ldi
      </div>
      <h1 className="text-2xl font-semibold">Sahifani yuklab bo'lmadi</h1>
      <p className="max-w-md text-sm text-zinc-400">{error.message}</p>
      <Button onClick={reset}>Qaytadan urinish</Button>
    </div>
  );
}
