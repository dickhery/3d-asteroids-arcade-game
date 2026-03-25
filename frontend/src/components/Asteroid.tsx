import { useRef } from 'react';
import * as THREE from 'three';

interface AsteroidProps {
  position: [number, number, number];
  rotation: [number, number, number];
  size: number;
}

export default function Asteroid({ position, rotation, size }: AsteroidProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  return (
    <mesh ref={meshRef} position={position} rotation={rotation}>
      <dodecahedronGeometry args={[size, 0]} />
      <meshStandardMaterial
        color="#8b7355"
        roughness={0.9}
        metalness={0.1}
      />
    </mesh>
  );
}
