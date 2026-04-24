"use client";

import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { Line } from "@react-three/drei";
import { GEOJSON_NAME_MAP } from "@/lib/regions";
import { latLonToVec3, GLOBE_RADIUS } from "./projection";

type GeoFeature = {
  type: "Feature";
  properties: { shapeName: string };
  geometry:
    | { type: "Polygon"; coordinates: number[][][] }
    | { type: "MultiPolygon"; coordinates: number[][][][] };
};

type GeoCollection = { type: "FeatureCollection"; features: GeoFeature[] };

type RingData = {
  region: string;
  points: THREE.Vector3[];
};

function toRings(geo: GeoCollection): RingData[] {
  const radius = GLOBE_RADIUS * 1.003;
  const rings: RingData[] = [];
  for (const feat of geo.features) {
    const region = GEOJSON_NAME_MAP[feat.properties.shapeName] ?? feat.properties.shapeName;
    const polygons =
      feat.geometry.type === "Polygon"
        ? [feat.geometry.coordinates]
        : feat.geometry.coordinates;
    for (const polygon of polygons) {
      for (const ring of polygon) {
        const points = ring.map(([lon, lat]) => latLonToVec3(lat, lon, radius));
        rings.push({ region, points });
      }
    }
  }
  return rings;
}

export function RegionOutlines({
  alertCountByRegion,
  onRegionClick,
}: {
  alertCountByRegion: Map<string, number>;
  onRegionClick?: (region: string) => void;
}) {
  const [geo, setGeo] = useState<GeoCollection | null>(null);

  useEffect(() => {
    fetch("/uz-regions.geojson")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: GeoCollection | null) => setGeo(data))
      .catch(() => setGeo(null));
  }, []);

  const rings = useMemo(() => (geo ? toRings(geo) : []), [geo]);
  const max = Math.max(1, ...alertCountByRegion.values());

  if (rings.length === 0) return null;

  return (
    <group>
      {rings.map((r, i) => {
        const count = alertCountByRegion.get(r.region) ?? 0;
        const color =
          count === 0 ? "#10b981" : count >= max * 0.7 ? "#ef4444" : "#f97316";
        const opacity = count === 0 ? 0.35 : 0.8;
        return (
          <Line
            key={`${r.region}-${i}`}
            points={r.points}
            color={color}
            transparent
            opacity={opacity}
            lineWidth={count > 0 ? 1.6 : 1.0}
            onClick={(e) => {
              e.stopPropagation();
              onRegionClick?.(r.region);
            }}
          />
        );
      })}
    </group>
  );
}
