import { useRef } from 'react';
import * as THREE from 'three';

interface ExplosionProps {
  position: [number, number, number];
  size: number;
  frame: number;
}

export default function Explosion({ position, size, frame }: ExplosionProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  const alpha = 1 - frame / 30;
  const scale = size * (1 + frame / 15);

  return (
    <mesh ref={meshRef} position={position} scale={[scale, scale, scale]}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshBasicMaterial
        color="#ff6600"
        transparent
        opacity={alpha}
      />
    </mesh>
  );
}
