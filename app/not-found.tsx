import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-black text-center text-zinc-200">
      <div className="text-[10px] uppercase tracking-[0.4em] text-emerald-500">404</div>
      <h1 className="text-2xl font-semibold">Sahifa topilmadi</h1>
      <Link href="/" className="text-sm text-emerald-400 hover:text-emerald-300">
        ← Bosh sahifaga qaytish
      </Link>
    </div>
  );
}
