import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SpaceshipProps {
  position: [number, number, number];
  rotation: number;
  onPositionChange: (pos: [number, number, number]) => void;
  onRotationChange: (rot: number) => void;
  keys: { [key: string]: boolean };
  isPaused: boolean;
  isGameOver: boolean;
}

export default function Spaceship({
  position,
  rotation,
  onPositionChange,
  onRotationChange,
  keys,
  isPaused,
  isGameOver,
}: SpaceshipProps) {
  const meshRef = useRef<THREE.Group>(null);
  const velocityRef = useRef<[number, number, number]>([0, 0, 0]);

  useFrame((state, delta) => {
    if (isPaused || isGameOver || !meshRef.current) return;

    const rotationSpeed = 0.08;
    const acceleration = 0.015;
    const maxSpeed = 0.8;

    let newRotation = rotation;
    let [vx, vy, vz] = velocityRef.current;

    // Rotation controls
    if (keys['arrowleft']) {
      newRotation += rotationSpeed;
    }
    if (keys['arrowright']) {
      newRotation -= rotationSpeed;
    }

    // Acceleration controls
    if (keys['arrowup']) {
      vx += Math.sin(newRotation) * acceleration;
      vz += Math.cos(newRotation) * acceleration;
    }

    if (keys['arrowdown']) {
      vx -= Math.sin(newRotation) * acceleration * 0.7;
      vz -= Math.cos(newRotation) * acceleration * 0.7;
    }

    // Apply velocity with max speed limit
    const currentSpeed = Math.sqrt(vx * vx + vz * vz);
    if (currentSpeed > maxSpeed) {
      vx = (vx / currentSpeed) * maxSpeed;
      vz = (vz / currentSpeed) * maxSpeed;
    }

    // Apply friction
    if (!keys['arrowup'] && !keys['arrowdown']) {
      vx *= 0.98;
      vz *= 0.98;
    }

    // Update position
    let [x, y, z] = position;
    x += vx;
    z += vz;

    // Wrap around boundaries
    const boundary = 80;
    if (x < -boundary) x = boundary;
    if (x > boundary) x = -boundary;
    if (z < -boundary) z = boundary;
    if (z > boundary) z = -boundary;

    velocityRef.current = [vx, vy, vz];
    onPositionChange([x, y, z]);
    onRotationChange(newRotation);

    // Update mesh rotation
    meshRef.current.rotation.y = newRotation;
  });

  return (
    <group ref={meshRef} position={position} scale={2.5}>
      {/* Main ship body - metallic material with 50% wider base */}
      <mesh>
        <coneGeometry args={[1.5, 3, 8]} />
        <meshStandardMaterial
          color="#88ccdd"
          metalness={0.9}
          roughness={0.2}
          emissive="#00ffff"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Wings - metallic with reflective highlights, adjusted for wider base */}
      <mesh position={[-1.2, 0, 0.5]} rotation={[0, 0, Math.PI / 6]}>
        <boxGeometry args={[0.3, 0.1, 1]} />
        <meshStandardMaterial 
          color="#5599bb" 
          metalness={0.85}
          roughness={0.25}
        />
      </mesh>
      <mesh position={[1.2, 0, 0.5]} rotation={[0, 0, -Math.PI / 6]}>
        <boxGeometry args={[0.3, 0.1, 1]} />
        <meshStandardMaterial 
          color="#5599bb" 
          metalness={0.85}
          roughness={0.25}
        />
      </mesh>

      {/* Bright cockpit at front - clearly distinguishable */}
      <mesh position={[0, 0.3, 0.8]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial 
          color="#ffffff" 
          emissive="#ffffff"
          emissiveIntensity={0.8}
          metalness={0.3}
          roughness={0.1}
          transparent 
          opacity={0.9} 
        />
      </mesh>
      
      {/* Front highlight light */}
      <pointLight position={[0, 0.3, 0.8]} intensity={3} color="#ffffff" distance={8} />

      {/* Rear thruster glow - darker exhaust area, adjusted for wider base */}
      <mesh position={[0, 0, -1.8]}>
        <cylinderGeometry args={[0.45, 0.6, 0.6, 8]} />
        <meshStandardMaterial 
          color="#1a1a2e" 
          emissive="#ff3300"
          emissiveIntensity={keys['arrowup'] ? 1.2 : 0.3}
          metalness={0.7}
          roughness={0.4}
        />
      </mesh>

      {/* Engine glow effect when accelerating */}
      {keys['arrowup'] && (
        <>
          <pointLight position={[0, 0, -2.5]} intensity={4} color="#ff6600" distance={12} />
          <mesh position={[0, 0, -2.2]}>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshBasicMaterial color="#ff6600" transparent opacity={0.7} />
          </mesh>
        </>
      )}
    </group>
  );
}
