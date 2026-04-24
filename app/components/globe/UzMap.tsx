"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { UZ_REGIONS } from "@/lib/regions";
import { latLonToVec3, GLOBE_RADIUS } from "./projection";

type Props = {
  alertCountByRegion: Map<string, number>;
  onRegionClick?: (regionName: string) => void;
};

export function UzMap({ alertCountByRegion, onRegionClick }: Props) {
  const entries = useMemo(() => Object.entries(UZ_REGIONS), []);
  const max = Math.max(1, ...alertCountByRegion.values());

  return (
    <group>
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
        <meshStandardMaterial
          color="#0a1f1a"
          roughness={0.85}
          metalness={0.1}
          emissive="#021512"
          emissiveIntensity={0.35}
        />
      </mesh>

      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS * 1.002, 48, 48]} />
        <meshBasicMaterial
          color="#10b981"
          transparent
          opacity={0.08}
          wireframe
        />
      </mesh>

      {entries.map(([name, r]) => {
        const pos = latLonToVec3(r.lat, r.lon, GLOBE_RADIUS);
        const normal = pos.clone().normalize();
        const count = alertCountByRegion.get(name) ?? 0;
        const intensity = count === 0 ? 0.15 : 0.4 + (count / max) * 0.6;
        const pillarHeight = 0.05 + (count / max) * 0.45;

        const quaternion = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          normal
        );
        const euler = new THREE.Euler().setFromQuaternion(quaternion);
        const pillarCenter = pos.clone().add(normal.clone().multiplyScalar(pillarHeight / 2));

        return (
          <group key={name}>
            <mesh
              position={pos}
              onClick={(e) => {
                e.stopPropagation();
                onRegionClick?.(name);
              }}
              onPointerOver={(e) => {
                e.stopPropagation();
                document.body.style.cursor = "pointer";
              }}
              onPointerOut={() => {
                document.body.style.cursor = "default";
              }}
            >
              <sphereGeometry args={[0.035, 16, 16]} />
              <meshBasicMaterial color={count > 0 ? "#f97316" : "#10b981"} />
            </mesh>

            {count > 0 && (
              <mesh position={pillarCenter} rotation={euler}>
                <cylinderGeometry args={[0.015, 0.025, pillarHeight, 10]} />
                <meshBasicMaterial
                  color={count > 4 ? "#ef4444" : "#f97316"}
                  transparent
                  opacity={intensity}
                />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}
