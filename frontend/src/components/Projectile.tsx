import { useRef } from 'react';
import * as THREE from 'three';

interface ProjectileProps {
  position: [number, number, number];
}

export default function Projectile({ position }: ProjectileProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.3, 8, 8]} />
        <meshStandardMaterial
          color="#ffff00"
          emissive="#ffff00"
          emissiveIntensity={1}
        />
      </mesh>
      <pointLight color="#ffff00" intensity={1} distance={5} />
    </group>
  );
}
