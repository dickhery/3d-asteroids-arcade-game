import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface BonusItemProps {
  position: [number, number, number];
  type: 'rapidFire' | 'bomb' | 'extraLife' | 'repair';
}

export default function BonusItem({ position, type }: BonusItemProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  const colors = {
    rapidFire: '#ff6600',
    bomb: '#ff0000',
    extraLife: '#00ff00',
    repair: '#0099ff',
  };

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.02;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.5;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial
          color={colors[type]}
          emissive={colors[type]}
          emissiveIntensity={0.5}
        />
      </mesh>
      <pointLight color={colors[type]} intensity={1} distance={10} />
    </group>
  );
}
