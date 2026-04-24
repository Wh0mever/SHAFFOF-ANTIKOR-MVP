"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type Props = {
  position: THREE.Vector3;
  color?: string;
  maxScale?: number;
  duration?: number;
};

export function PulseRing({ position, color = "#ef4444", maxScale = 3, duration = 2 }: Props) {
  const ringRef = useRef<THREE.Mesh>(null);
  const t = useRef(Math.random() * duration);

  useFrame((_, delta) => {
    const mesh = ringRef.current;
    if (!mesh) return;
    t.current += delta;
    const phase = (t.current % duration) / duration;
    const scale = 1 + phase * (maxScale - 1);
    mesh.scale.setScalar(scale);
    const mat = mesh.material as THREE.MeshBasicMaterial;
    mat.opacity = 1 - phase;
  });

  const normal = position.clone().normalize();
  const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
  const euler = new THREE.Euler().setFromQuaternion(quaternion);

  return (
    <mesh ref={ringRef} position={position} rotation={euler}>
      <ringGeometry args={[0.05, 0.07, 32]} />
      <meshBasicMaterial color={color} transparent opacity={0.8} side={THREE.DoubleSide} />
    </mesh>
  );
}
