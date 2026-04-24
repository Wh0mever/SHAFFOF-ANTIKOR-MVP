import * as THREE from "three";
import { UZ_REGIONS } from "@/lib/regions";

export const GLOBE_RADIUS = 2;

export function latLonToVec3(lat: number, lon: number, radius = GLOBE_RADIUS): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

export function regionPosition(regionName: string, radius = GLOBE_RADIUS): THREE.Vector3 | null {
  const r = UZ_REGIONS[regionName];
  if (!r) return null;
  return latLonToVec3(r.lat, r.lon, radius);
}
