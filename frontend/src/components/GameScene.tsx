import { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import Spaceship from './Spaceship';
import Asteroid from './Asteroid';
import Projectile from './Projectile';
import BonusItem from './BonusItem';
import Explosion from './Explosion';
import { toast } from 'sonner';

interface GameSceneProps {
  lives: number;
  onLoseLife: () => void;
  onScoreUpdate: (points: number) => void;
  onSurvivalUpdate: (time: number) => void;
  isGameOver: boolean;
  isPaused: boolean;
  onPauseToggle: (paused: boolean) => void;
  onBombStatusChange: (available: boolean, cooldownPercent: number) => void;
}

interface AsteroidData {
  id: number;
  position: [number, number, number];
  velocity: [number, number, number];
  rotation: [number, number, number];
  rotationSpeed: [number, number, number];
  size: number;
  health: number;
}

interface ProjectileData {
  id: number;
  position: [number, number, number];
  velocity: [number, number, number];
}

interface BonusData {
  id: number;
  position: [number, number, number];
  type: 'rapidFire' | 'bomb' | 'extraLife' | 'repair';
}

interface ExplosionData {
  id: number;
  position: [number, number, number];
  size: number;
  frame: number;
}

const BOMB_COOLDOWN = 15000; // 15 seconds cooldown
const BOMB_RADIUS = 50; // Explosion radius
const WORLD_BOUNDS = 250; // Expanded from 150 to 250
const SPAWN_DISTANCE = 120; // Expanded from 80 to 120
const BONUS_SPAWN_DISTANCE = 60; // Expanded from 40 to 60
const PROJECTILE_MAX_DISTANCE = 150; // Expanded from 100 to 150

export default function GameScene({
  lives,
  onLoseLife,
  onScoreUpdate,
  onSurvivalUpdate,
  isGameOver,
  isPaused,
  onPauseToggle,
  onBombStatusChange,
}: GameSceneProps) {
  const { camera } = useThree();
  const [asteroids, setAsteroids] = useState<AsteroidData[]>([]);
  const [projectiles, setProjectiles] = useState<ProjectileData[]>([]);
  const [bonuses, setBonuses] = useState<BonusData[]>([]);
  const [explosions, setExplosions] = useState<ExplosionData[]>([]);
  const [shipPosition, setShipPosition] = useState<[number, number, number]>([0, 0, 0]);
  const [shipRotation, setShipRotation] = useState(0);
  const [fireRate, setFireRate] = useState(300);
  const [bombCooldownEnd, setBombCooldownEnd] = useState(0);

  const gameStateRef = useRef({
    lastFire: 0,
    lastAsteroidSpawn: 0,
    lastBonusSpawn: 0,
    survivalTime: 0,
    asteroidIdCounter: 0,
    projectileIdCounter: 0,
    bonusIdCounter: 0,
    explosionIdCounter: 0,
    keys: {} as { [key: string]: boolean },
    spaceLastPressed: 0,
    isShooting: false,
    lastTouchTime: 0,
    touchCount: 0,
  });

  // Setup keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      gameStateRef.current.keys[key] = true;

      if (e.key === 'Escape') {
        onPauseToggle(!isPaused);
      }

      if (e.key === ' ') {
        e.preventDefault();
        const now = Date.now();
        const timeSinceLastPress = now - gameStateRef.current.spaceLastPressed;

        // Double-tap detection (within 400ms)
        if (timeSinceLastPress < 400 && timeSinceLastPress > 50) {
          activateBomb();
          gameStateRef.current.spaceLastPressed = 0;
        } else {
          gameStateRef.current.spaceLastPressed = now;
          gameStateRef.current.isShooting = true;
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      gameStateRef.current.keys[key] = false;

      if (e.key === ' ') {
        gameStateRef.current.isShooting = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPaused, onPauseToggle]);

  // Setup mobile touch controls for bomb
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (isGameOver || isPaused) return;

      const now = Date.now();
      const timeSinceLastTouch = now - gameStateRef.current.lastTouchTime;

      // Double-tap detection (within 400ms)
      if (timeSinceLastTouch < 400 && timeSinceLastTouch > 50) {
        activateBomb();
        gameStateRef.current.touchCount = 0;
        gameStateRef.current.lastTouchTime = 0;
      } else {
        gameStateRef.current.touchCount = 1;
        gameStateRef.current.lastTouchTime = now;
      }
    };

    window.addEventListener('touchstart', handleTouchStart);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
    };
  }, [isGameOver, isPaused]);

  // Spawn initial asteroid
  useEffect(() => {
    if (asteroids.length === 0 && !isGameOver) {
      spawnAsteroid();
    }
  }, []);

  const spawnAsteroid = () => {
    const angle = Math.random() * Math.PI * 2;
    const distance = SPAWN_DISTANCE;
    const x = Math.cos(angle) * distance;
    const z = Math.sin(angle) * distance;
    
    // Progressive speed increase based on survival time (smooth scaling)
    const survivalSeconds = gameStateRef.current.survivalTime / 1000;
    // Speed increases every 30 seconds alongside spawn rate
    const speedMultiplier = 1 + (survivalSeconds / 30) * 0.3; // Increases by 0.3x every 30 seconds
    const baseSpeed = 0.2 + Math.random() * 0.3;
    const speed = baseSpeed * speedMultiplier;
    
    const dirX = -x;
    const dirZ = -z;
    const len = Math.sqrt(dirX * dirX + dirZ * dirZ);

    const newAsteroid: AsteroidData = {
      id: gameStateRef.current.asteroidIdCounter++,
      position: [x, 0, z],
      velocity: [(dirX / len) * speed, 0, (dirZ / len) * speed],
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
      rotationSpeed: [
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02,
      ],
      size: 3 + Math.random() * 4,
      health: 100,
    };

    setAsteroids((prev) => [...prev, newAsteroid]);
  };

  const spawnBonus = () => {
    const types: BonusData['type'][] = ['rapidFire', 'bomb', 'extraLife', 'repair'];
    const type = types[Math.floor(Math.random() * types.length)];
    const angle = Math.random() * Math.PI * 2;
    const distance = BONUS_SPAWN_DISTANCE;

    const newBonus: BonusData = {
      id: gameStateRef.current.bonusIdCounter++,
      position: [Math.cos(angle) * distance, 0, Math.sin(angle) * distance],
      type,
    };

    setBonuses((prev) => [...prev, newBonus]);
  };

  const fire = () => {
    const now = Date.now();
    if (now - gameStateRef.current.lastFire < fireRate) return;

    gameStateRef.current.lastFire = now;

    const newProjectile: ProjectileData = {
      id: gameStateRef.current.projectileIdCounter++,
      position: [...shipPosition],
      velocity: [Math.sin(shipRotation) * 1.5, 0, Math.cos(shipRotation) * 1.5],
    };

    setProjectiles((prev) => [...prev, newProjectile]);
  };

  const activateBomb = () => {
    if (isGameOver || isPaused) return;

    const now = Date.now();
    
    // STRICT ENFORCEMENT: Bomb can ONLY be used when cooldown is completely finished
    if (now < bombCooldownEnd) {
      // Completely ignore activation attempts during cooldown - no toast, no effect
      return;
    }

    // Bomb is fully charged and ready - detonate it
    setBombCooldownEnd(now + BOMB_COOLDOWN);

    // Create large explosion at ship position
    addExplosion(shipPosition, BOMB_RADIUS);

    // Destroy asteroids within radius and award points
    let destroyedCount = 0;
    let totalPoints = 0;

    setAsteroids((prev) =>
      prev.filter((asteroid) => {
        const dx = asteroid.position[0] - shipPosition[0];
        const dz = asteroid.position[2] - shipPosition[2];
        const distance = Math.sqrt(dx * dx + dz * dz);

        if (distance < BOMB_RADIUS) {
          // Create explosion for each destroyed asteroid
          addExplosion(asteroid.position, asteroid.size);
          const points = Math.floor(asteroid.size * 3);
          totalPoints += points;
          destroyedCount++;
          return false; // Remove asteroid
        }
        return true; // Keep asteroid
      })
    );

    // Award points
    if (totalPoints > 0) {
      onScoreUpdate(totalPoints);
    }

    toast.success(`Bomb detonated! ${destroyedCount} asteroids destroyed!`);
  };

  const addExplosion = (position: [number, number, number], size: number) => {
    const newExplosion: ExplosionData = {
      id: gameStateRef.current.explosionIdCounter++,
      position,
      size,
      frame: 0,
    };
    setExplosions((prev) => [...prev, newExplosion]);
  };

  const handleBonusCollect = (type: BonusData['type']) => {
    switch (type) {
      case 'rapidFire':
        setFireRate(150);
        setTimeout(() => setFireRate(300), 10000);
        toast.success('Rapid Fire!');
        break;
      case 'bomb':
        // Reset cooldown to make bomb immediately available
        setBombCooldownEnd(0);
        toast.success('Bomb ready! Double-tap SPACE or screen');
        break;
      case 'extraLife':
        toast.success('Extra Life!');
        break;
      case 'repair':
        toast.success('Repair bonus!');
        break;
    }
  };

  useFrame((state, delta) => {
    if (isPaused || isGameOver) return;

    const deltaMs = delta * 1000;
    gameStateRef.current.survivalTime += deltaMs;
    onSurvivalUpdate(Math.floor(gameStateRef.current.survivalTime));

    // Update bomb status for HUD
    const now = Date.now();
    const isBombAvailable = now >= bombCooldownEnd;
    const cooldownPercent = now < bombCooldownEnd 
      ? Math.max(0, Math.min(100, ((BOMB_COOLDOWN - (bombCooldownEnd - now)) / BOMB_COOLDOWN) * 100))
      : 100;
    onBombStatusChange(isBombAvailable, cooldownPercent);

    // Continuous shooting
    if (gameStateRef.current.isShooting) {
      fire();
    }

    // Update asteroids
    setAsteroids((prev) =>
      prev.filter((asteroid) => {
        const newPos: [number, number, number] = [
          asteroid.position[0] + asteroid.velocity[0],
          asteroid.position[1] + asteroid.velocity[1],
          asteroid.position[2] + asteroid.velocity[2],
        ];

        const newRot: [number, number, number] = [
          asteroid.rotation[0] + asteroid.rotationSpeed[0],
          asteroid.rotation[1] + asteroid.rotationSpeed[1],
          asteroid.rotation[2] + asteroid.rotationSpeed[2],
        ];

        // Check collision with ship (adjusted for larger ship size)
        const dx = newPos[0] - shipPosition[0];
        const dz = newPos[2] - shipPosition[2];
        const dist = Math.sqrt(dx * dx + dz * dz);

        if (dist < asteroid.size + 4) {
          onLoseLife();
          addExplosion(newPos, asteroid.size);
          return false;
        }

        // Remove if too far (expanded bounds)
        if (Math.abs(newPos[0]) > WORLD_BOUNDS || Math.abs(newPos[2]) > WORLD_BOUNDS) {
          return false;
        }

        asteroid.position = newPos;
        asteroid.rotation = newRot;
        return true;
      })
    );

    // Update projectiles
    setProjectiles((prev) =>
      prev.filter((proj) => {
        const newPos: [number, number, number] = [
          proj.position[0] + proj.velocity[0],
          proj.position[1] + proj.velocity[1],
          proj.position[2] + proj.velocity[2],
        ];

        // Check collision with asteroids
        let hit = false;
        setAsteroids((asteroidsPrev) =>
          asteroidsPrev.filter((asteroid) => {
            const dx = newPos[0] - asteroid.position[0];
            const dz = newPos[2] - asteroid.position[2];
            const dist = Math.sqrt(dx * dx + dz * dz);

            if (dist < asteroid.size) {
              asteroid.health -= 50;
              if (asteroid.health <= 0) {
                addExplosion(asteroid.position, asteroid.size);
                onScoreUpdate(Math.floor(asteroid.size * 5));
                hit = true;
                return false;
              }
            }
            return true;
          })
        );

        if (hit) return false;

        // Remove if too far (expanded bounds)
        if (Math.abs(newPos[0]) > PROJECTILE_MAX_DISTANCE || Math.abs(newPos[2]) > PROJECTILE_MAX_DISTANCE) {
          return false;
        }

        proj.position = newPos;
        return true;
      })
    );

    // Update bonuses
    setBonuses((prev) =>
      prev.filter((bonus) => {
        const dx = bonus.position[0] - shipPosition[0];
        const dz = bonus.position[2] - shipPosition[2];
        const dist = Math.sqrt(dx * dx + dz * dz);

        if (dist < 5) {
          handleBonusCollect(bonus.type);
          return false;
        }
        return true;
      })
    );

    // Update explosions
    setExplosions((prev) =>
      prev.filter((exp) => {
        exp.frame++;
        return exp.frame < 30;
      })
    );

    // Progressive difficulty: spawn asteroids with increasing frequency
    const nowTime = Date.now();
    const survivalSeconds = gameStateRef.current.survivalTime / 1000;
    
    // Calculate spawn rate multiplier: starts at 1.0, increases by 0.4 every 30 seconds
    const spawnRateMultiplier = 1 + Math.floor(survivalSeconds / 30) * 0.4;
    
    // Base spawn interval: random between 2000ms (2s) and 5000ms (5s)
    // Divide by multiplier to increase frequency over time
    const baseInterval = 2000 + Math.random() * 3000; // 2-5 seconds
    const adjustedInterval = baseInterval / spawnRateMultiplier;
    
    if (nowTime - gameStateRef.current.lastAsteroidSpawn > adjustedInterval) {
      gameStateRef.current.lastAsteroidSpawn = nowTime;
      spawnAsteroid();
    }

    // Spawn bonuses
    if (nowTime - gameStateRef.current.lastBonusSpawn > 15000) {
      gameStateRef.current.lastBonusSpawn = nowTime;
      if (Math.random() > 0.5) {
        spawnBonus();
      }
    }
  });

  return (
    <>
      {/* Lighting - enhanced for metallic materials and infinite space */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />
      <pointLight position={[0, 10, 0]} intensity={0.5} color="#00ffff" />
      <pointLight position={[-15, 5, -15]} intensity={0.3} color="#ffffff" />

      {/* Black space with white stars - no purple tint */}
      <Stars />

      {/* Spaceship */}
      <Spaceship
        position={shipPosition}
        rotation={shipRotation}
        onPositionChange={setShipPosition}
        onRotationChange={setShipRotation}
        keys={gameStateRef.current.keys}
        isPaused={isPaused}
        isGameOver={isGameOver}
      />

      {/* Asteroids */}
      {asteroids.map((asteroid) => (
        <Asteroid
          key={asteroid.id}
          position={asteroid.position}
          rotation={asteroid.rotation}
          size={asteroid.size}
        />
      ))}

      {/* Projectiles */}
      {projectiles.map((proj) => (
        <Projectile key={proj.id} position={proj.position} />
      ))}

      {/* Bonuses */}
      {bonuses.map((bonus) => (
        <BonusItem key={bonus.id} position={bonus.position} type={bonus.type} />
      ))}

      {/* Explosions */}
      {explosions.map((exp) => (
        <Explosion key={exp.id} position={exp.position} size={exp.size} frame={exp.frame} />
      ))}
    </>
  );
}

function Stars() {
  const starsRef = useRef<THREE.Points>(null);
  const starCount = 1500; // Increased from 1200 for expanded view
  const timeRef = useRef(0);

  const positions = new Float32Array(starCount * 3);
  const sizes = new Float32Array(starCount);

  for (let i = 0; i < starCount; i++) {
    // Create stars in a larger sphere for expanded world
    const radius = 200 + Math.random() * 150; // Expanded from 150-250 to 200-350
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.cos(phi);
    positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    
    // Varied star sizes for depth
    sizes[i] = Math.random() * 1.2 + 0.4;
  }

  useFrame((state, delta) => {
    if (!starsRef.current) return;
    
    timeRef.current += delta * 0.2; // Very slow animation
    
    // Extremely subtle rotation for infinite space feel
    starsRef.current.rotation.y = timeRef.current * 0.005;
    
    // Update star opacity for subtle twinkling effect
    const material = starsRef.current.material as THREE.PointsMaterial;
    material.opacity = 0.6 + Math.sin(timeRef.current * 0.4) * 0.15; // Minimal twinkle
  });

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[sizes, 1]}
        />
      </bufferGeometry>
      <pointsMaterial 
        size={0.8} 
        color="#ffffff" 
        sizeAttenuation={true}
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
