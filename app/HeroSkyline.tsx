"use client";

import { Environment, Float, MeshReflectorMaterial, PerspectiveCamera, Sparkles } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

/* Deterministic pseudo-random so the skyline renders identically every visit. */
function seeded(index: number, salt: number) {
  const value = Math.sin(index * 127.1 + salt * 311.7) * 43758.5453;
  return value - Math.floor(value);
}

type TowerSpec = {
  position: [number, number, number];
  width: number;
  height: number;
  depth: number;
  gold: boolean;
};

function Tower({ spec, index }: { spec: TowerSpec; index: number }) {
  const windows = useMemo(() => {
    const rows = Math.max(2, Math.floor(spec.height * 2.2));
    const items: { y: number; lit: boolean }[] = [];
    for (let row = 0; row < rows; row += 1) {
      items.push({
        y: -spec.height / 2 + 0.35 + row * (spec.height / rows),
        lit: seeded(index * 31 + row, 7) > 0.42
      });
    }
    return items;
  }, [spec.height, index]);

  const accent = spec.gold ? "#e7cf9a" : "#5eead4";

  return (
    <group position={spec.position}>
      <mesh castShadow receiveShadow position={[0, spec.height / 2, 0]}>
        <boxGeometry args={[spec.width, spec.height, spec.depth]} />
        <meshStandardMaterial color="#0d1522" roughness={0.35} metalness={0.55} />
      </mesh>
      {windows.map((window, row) =>
        window.lit ? (
          <mesh key={row} position={[0, spec.height / 2 + window.y, spec.depth / 2 + 0.012]}>
            <planeGeometry args={[spec.width * 0.78, 0.05]} />
            <meshStandardMaterial
              emissive={accent}
              emissiveIntensity={spec.gold ? 2.1 : 1.5}
              color={accent}
              toneMapped={false}
            />
          </mesh>
        ) : null
      )}
      <mesh position={[0, spec.height + 0.03, 0]}>
        <boxGeometry args={[spec.width * 1.06, 0.06, spec.depth * 1.06]} />
        <meshStandardMaterial color="#1a2434" roughness={0.3} metalness={0.6} />
      </mesh>
    </group>
  );
}

function HeroTower() {
  const beacon = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    if (beacon.current) {
      beacon.current.intensity = 2.4 + Math.sin(clock.elapsedTime * 1.6) * 1.4;
    }
  });

  const floors = useMemo(() => Array.from({ length: 11 }, (_, row) => row), []);

  return (
    <group position={[0, 0, 0.4]}>
      <mesh castShadow receiveShadow position={[0, 2.6, 0]}>
        <boxGeometry args={[1.7, 5.2, 1.7]} />
        <meshStandardMaterial color="#101b2c" roughness={0.24} metalness={0.68} />
      </mesh>
      {floors.map((row) => (
        <group key={row} position={[0, 0.55 + row * 0.45, 0]}>
          <mesh position={[0, 0, 0.865]}>
            <planeGeometry args={[1.34, 0.07]} />
            <meshStandardMaterial emissive="#e7cf9a" emissiveIntensity={2.4} color="#f4e7c3" toneMapped={false} />
          </mesh>
          <mesh position={[0.865, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[1.34, 0.07]} />
            <meshStandardMaterial emissive="#e7cf9a" emissiveIntensity={1.7} color="#f4e7c3" toneMapped={false} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 5.32, 0]}>
        <boxGeometry args={[1.85, 0.1, 1.85]} />
        <meshStandardMaterial color="#1d2a3d" roughness={0.3} metalness={0.65} />
      </mesh>
      <mesh position={[0, 5.62, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.5, 8]} />
        <meshStandardMaterial emissive="#34d399" emissiveIntensity={3} color="#34d399" toneMapped={false} />
      </mesh>
      <pointLight ref={beacon} position={[0, 5.9, 0]} color="#34d399" distance={7} intensity={3} />
    </group>
  );
}

function City() {
  const group = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!group.current) return;
    group.current.rotation.y = Math.sin(clock.elapsedTime * 0.08) * 0.16 + clock.elapsedTime * 0.012;
  });

  const towers = useMemo<TowerSpec[]>(() => {
    const ring: TowerSpec[] = [];
    const count = 12;
    for (let index = 0; index < count; index += 1) {
      const angle = (index / count) * Math.PI * 2;
      const radius = 3.1 + seeded(index, 3) * 1.9;
      ring.push({
        position: [Math.cos(angle) * radius, 0, Math.sin(angle) * radius],
        width: 0.65 + seeded(index, 11) * 0.5,
        height: 1.4 + seeded(index, 17) * 2.4,
        depth: 0.65 + seeded(index, 23) * 0.5,
        gold: seeded(index, 29) > 0.6
      });
    }
    return ring;
  }, []);

  return (
    <group ref={group}>
      <Float speed={1.1} rotationIntensity={0.06} floatIntensity={0.18}>
        <HeroTower />
      </Float>
      {towers.map((spec, index) => (
        <Tower key={index} spec={spec} index={index} />
      ))}

      <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[8.5, 48]} />
        <MeshReflectorMaterial
          blur={[420, 110]}
          resolution={512}
          mixBlur={0.9}
          mixStrength={1.6}
          roughness={0.72}
          depthScale={0.4}
          color="#050a12"
          metalness={0.4}
        />
      </mesh>

      <Sparkles count={110} scale={[10, 5.5, 10]} position={[0, 2.6, 0]} size={2.2} speed={0.32} color="#e7cf9a" opacity={0.55} />
      <Sparkles count={60} scale={[7, 4, 7]} position={[0, 1.8, 0]} size={1.6} speed={0.22} color="#5eead4" opacity={0.4} />

      <pointLight position={[-3.4, 1.4, 3.2]} color="#e7cf9a" intensity={2.4} distance={9} />
      <pointLight position={[3.6, 2.2, 2.6]} color="#34d399" intensity={2} distance={9} />
      <pointLight position={[0, 0.6, 4.4]} color="#67e8f9" intensity={1.1} distance={7} />
    </group>
  );
}

function CameraRig() {
  useFrame(({ camera, pointer }) => {
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.x * 1.6, 0.045);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 3.4 + pointer.y * 0.9, 0.045);
    camera.lookAt(0, 2, 0);
  });
  return null;
}

export default function HeroSkyline() {
  return (
    <div className="h-full w-full" aria-hidden>
      <Canvas shadows dpr={[1, 1.75]} gl={{ antialias: true, alpha: true }}>
        <PerspectiveCamera makeDefault position={[0, 3.4, 9.6]} fov={38} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 9, 6]} intensity={1.6} castShadow />
        <fog attach="fog" args={["#020617", 11, 20]} />
        <City />
        <CameraRig />
        <Environment preset="night" />
      </Canvas>
    </div>
  );
}
