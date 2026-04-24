"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { regionPosition } from "./projection";
import { severityColor } from "@/lib/utils";

export type ParticleAlert = {
  id: string;
  region: string;
  severity: number;
  ruleCode: string;
};

type Props = {
  alerts: ParticleAlert[];
};

export function AlertParticles({ alerts }: Props) {
  return (
    <group>
      {alerts.slice(0, 200).map((a, i) => (
        <Particle key={a.id} alert={a} seed={i} />
      ))}
    </group>
  );
}

function Particle({ alert, seed }: { alert: ParticleAlert; seed: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const base = useMemo(() => regionPosition(alert.region) ?? new THREE.Vector3(0, 2, 0), [alert.region]);
  const normal = useMemo(() => base.clone().normalize(), [base]);
  const phase = useMemo(() => (seed * 0.31) % 1, [seed]);
  const life = useRef(phase);

  useFrame((_, delta) => {
    life.current = (life.current + delta * 0.25) % 1;
    const mesh = ref.current;
    if (!mesh) return;
    const pos = base.clone().add(normal.clone().multiplyScalar(life.current * 0.7));
    mesh.position.copy(pos);
    const mat = mesh.material as THREE.MeshBasicMaterial;
    mat.opacity = 1 - life.current;
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.02, 8, 8]} />
      <meshBasicMaterial color={severityColor(alert.severity)} transparent opacity={1} />
    </mesh>
  );
}
