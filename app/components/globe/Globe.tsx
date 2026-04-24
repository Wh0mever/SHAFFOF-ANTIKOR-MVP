"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { Suspense, useMemo } from "react";
import { UzMap } from "./UzMap";
import { RegionOutlines } from "./RegionOutlines";
import { AlertParticles, type ParticleAlert } from "./AlertParticles";
import { PulseRing } from "./PulseRing";
import { regionPosition } from "./projection";
import { severityColor } from "@/lib/utils";

type Props = {
  alerts: ParticleAlert[];
  onRegionClick?: (regionName: string) => void;
};

export function Globe({ alerts, onRegionClick }: Props) {
  const countByRegion = useMemo(() => {
    const m = new Map<string, number>();
    for (const a of alerts) m.set(a.region, (m.get(a.region) ?? 0) + 1);
    return m;
  }, [alerts]);

  const criticals = useMemo(
    () => alerts.filter((a) => a.severity >= 80).slice(0, 20),
    [alerts]
  );

  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      className="!bg-transparent"
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1.1} color="#e7fff6" />
        <pointLight position={[-4, -3, -5]} intensity={0.6} color="#6ee7b7" />

        <Stars radius={50} depth={30} count={3500} factor={4} fade speed={0.4} />

        <UzMap alertCountByRegion={countByRegion} onRegionClick={onRegionClick} />
        <RegionOutlines alertCountByRegion={countByRegion} onRegionClick={onRegionClick} />
        <AlertParticles alerts={alerts} />

        {criticals.map((a) => {
          const pos = regionPosition(a.region);
          if (!pos) return null;
          return (
            <PulseRing
              key={a.id}
              position={pos}
              color={severityColor(a.severity)}
              duration={1.8 + (a.severity % 7) * 0.1}
            />
          );
        })}

        <OrbitControls
          enableZoom
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.35}
          minDistance={3}
          maxDistance={8}
        />
      </Suspense>
    </Canvas>
  );
}
