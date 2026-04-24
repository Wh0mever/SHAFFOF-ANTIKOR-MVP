"use client";

import { Button } from "../ui/button";

export type FeedFilterState = {
  severity: number;
  region: string | null;
  ruleCode: string | null;
};

const RULES = ["SOLO", "PRICE_SPIKE", "SERIAL", "RUSHED", "ROUND", "REGION"];
const REGIONS = [
  "Toshkent shahri",
  "Samarqand viloyati",
  "Buxoro viloyati",
  "Andijon viloyati",
  "Farg'ona viloyati",
  "Namangan viloyati",
  "Qashqadaryo viloyati",
  "Surxondaryo viloyati",
  "Jizzax viloyati",
  "Sirdaryo viloyati",
  "Navoiy viloyati",
  "Xorazm viloyati",
  "Qoraqalpog'iston Respublikasi",
  "Toshkent viloyati",
];

export function FeedFilters({
  value,
  onChange,
}: {
  value: FeedFilterState;
  onChange: (next: FeedFilterState) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-950/60 p-3 backdrop-blur">
      <div className="flex items-center gap-2">
        <label className="text-[10px] uppercase tracking-wider text-zinc-500">
          Min severity
        </label>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={value.severity}
          onChange={(e) => onChange({ ...value, severity: Number(e.target.value) })}
          className="h-1 w-32 appearance-none rounded-full bg-zinc-800 accent-emerald-500"
        />
        <span className="w-8 text-right text-sm tabular-nums text-emerald-400">
          {value.severity}
        </span>
      </div>

      <select
        value={value.region ?? ""}
        onChange={(e) => onChange({ ...value, region: e.target.value || null })}
        className="h-8 rounded-md border border-zinc-800 bg-black px-2 text-xs text-zinc-200 focus:border-emerald-500 focus:outline-none"
      >
        <option value="">Barcha viloyatlar</option>
        {REGIONS.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>

      <div className="flex flex-wrap gap-1">
        {RULES.map((r) => (
          <Button
            key={r}
            size="sm"
            variant={value.ruleCode === r ? "primary" : "outline"}
            onClick={() => onChange({ ...value, ruleCode: value.ruleCode === r ? null : r })}
          >
            {r}
          </Button>
        ))}
      </div>

      {(value.region || value.ruleCode || value.severity > 0) && (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onChange({ severity: 0, region: null, ruleCode: null })}
        >
          Tozalash
        </Button>
      )}
    </div>
  );
}
