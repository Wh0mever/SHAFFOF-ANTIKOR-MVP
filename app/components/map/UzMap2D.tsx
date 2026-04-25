"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// SVG region IDs (from simplemaps uz.svg) → canonical region key in UZ_REGIONS.
export const SVG_ID_TO_REGION: Record<string, string> = {
  UZTK: "Toshkent shahri",
  UZTO: "Toshkent viloyati",
  UZSA: "Samarqand viloyati",
  UZBU: "Buxoro viloyati",
  UZAN: "Andijon viloyati",
  UZFA: "Farg'ona viloyati",
  UZNG: "Namangan viloyati",
  UZQA: "Qashqadaryo viloyati",
  UZSU: "Surxondaryo viloyati",
  UZJI: "Jizzax viloyati",
  UZSI: "Sirdaryo viloyati",
  UZNW: "Navoiy viloyati",
  UZXO: "Xorazm viloyati",
  UZQR: "Qoraqalpog'iston Respublikasi",
};

export type RegionRiskMap = Map<string, { score: number; count: number }>;

function colorFor(score: number): string {
  if (score === 0) return "#1f2937"; // gray (no data)
  if (score >= 60) return "#dc2626"; // critical red
  if (score >= 45) return "#ea580c"; // orange high
  if (score >= 30) return "#d97706"; // amber medium
  if (score >= 15) return "#16a34a"; // low green
  return "#65a30d";
}

export function UzMap2D({
  riskByRegion,
  selectedRegion,
  onSelect,
  pulsingRegions = new Set<string>(),
}: {
  riskByRegion: RegionRiskMap;
  selectedRegion: string | null;
  onSelect: (regionKey: string | null) => void;
  pulsingRegions?: Set<string>;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/uz.svg")
      .then((r) => r.text())
      .then((text) => {
        if (cancelled || !containerRef.current) return;
        const svg = text.replace(/<\?xml[^?]*\?>/g, "").replace(/<!--[\s\S]*?-->/g, "");
        containerRef.current.innerHTML = svg;
        const root = containerRef.current.querySelector("svg");
        if (root) {
          root.removeAttribute("width");
          root.removeAttribute("height");
          root.setAttribute("preserveAspectRatio", "xMidYMid meet");
          root.style.width = "100%";
          root.style.height = "100%";
        }
        setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!loaded || !containerRef.current) return;
    const root = containerRef.current.querySelector("svg");
    if (!root) return;

    const paths = root.querySelectorAll("path[id]");
    paths.forEach((el) => {
      const id = el.getAttribute("id") ?? "";
      const regionKey = SVG_ID_TO_REGION[id];
      if (!regionKey) return;
      const data = riskByRegion.get(regionKey);
      const score = data?.score ?? 0;
      const fill = colorFor(score);
      const isSelected = selectedRegion === regionKey;
      const pulsing = pulsingRegions.has(regionKey);
      el.setAttribute("fill", fill);
      el.setAttribute("stroke", isSelected ? "#10b981" : "rgba(255,255,255,0.18)");
      el.setAttribute("stroke-width", isSelected ? "2" : "0.6");
      (el as SVGPathElement).style.cursor = "pointer";
      (el as SVGPathElement).style.transition = "fill 0.4s, stroke 0.2s";
      (el as SVGPathElement).style.filter = pulsing
        ? "drop-shadow(0 0 8px rgba(244,63,94,0.85))"
        : "none";
      if (pulsing) {
        (el as SVGPathElement).classList.add("uz-pulse");
      } else {
        (el as SVGPathElement).classList.remove("uz-pulse");
      }
    });
  }, [loaded, riskByRegion, selectedRegion, pulsingRegions]);

  useEffect(() => {
    if (!loaded || !containerRef.current) return;
    const root = containerRef.current.querySelector("svg");
    if (!root) return;
    const handler = (e: Event) => {
      const target = e.target as Element;
      const path = target.closest("path[id]");
      if (!path) return;
      const id = path.getAttribute("id") ?? "";
      const regionKey = SVG_ID_TO_REGION[id];
      if (regionKey) onSelect(regionKey);
    };
    root.addEventListener("click", handler);
    return () => root.removeEventListener("click", handler);
  }, [loaded, onSelect]);

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className={cn("h-full w-full transition-opacity", !loaded && "opacity-0")} />
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-zinc-600">
          Загрузка карты…
        </div>
      )}
      <style jsx>{`
        :global(.uz-pulse) {
          animation: uz-pulse 2s ease-in-out infinite;
        }
        @keyframes uz-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}
