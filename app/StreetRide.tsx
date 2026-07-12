"use client";

import { Environment, PerspectiveCamera } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useScroll } from "framer-motion";
import { useMemo, useRef } from "react";
import * as THREE from "three";

/* Deterministic pseudo-random so the street renders identically every visit. */
function seeded(index: number, salt: number) {
  const value = Math.sin(index * 127.1 + salt * 311.7) * 43758.5453;
  return value - Math.floor(value);
}

const HOUSE_COLORS = ["#f4d9b8", "#cfe5d8", "#f7c8c8", "#dcd3f0", "#fdeec9", "#c9e3f5", "#e8d5c0", "#d8ecd0"];
const ROOF_COLORS = ["#8a4b32", "#6d4230", "#7c5138", "#5f3d2e"];
const STREET_LENGTH = 96;
const HOUSE_SPACING = 6;

function TerraceHouse({ index, side }: { index: number; side: 1 | -1 }) {
  const bodyColor = HOUSE_COLORS[Math.floor(seeded(index, side + 5) * HOUSE_COLORS.length)];
  const roofColor = ROOF_COLORS[Math.floor(seeded(index, side + 9) * ROOF_COLORS.length)];
  const height = 1.6 + seeded(index, side + 13) * 0.9;
  const z = -index * HOUSE_SPACING;
  const x = side * 4.6;

  return (
    <group position={[x, 0, z]} rotation={[0, side === 1 ? -Math.PI / 2 : Math.PI / 2, 0]}>
      {/* body */}
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.4, height, 2.6]} />
        <meshStandardMaterial color={bodyColor} roughness={0.85} />
      </mesh>
      {/* pitched roof */}
      <mesh position={[0, height + 0.55, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[2.55, 1.1, 4]} />
        <meshStandardMaterial color={roofColor} roughness={0.7} />
      </mesh>
      {/* door */}
      <mesh position={[0, 0.5, 1.31]}>
        <planeGeometry args={[0.6, 1]} />
        <meshStandardMaterial color="#4a3527" roughness={0.6} />
      </mesh>
      {/* windows */}
      {[-1, 1].map((wx) => (
        <mesh key={wx} position={[wx * 0.95, height * 0.62, 1.31]}>
          <planeGeometry args={[0.66, 0.5]} />
          <meshStandardMaterial
            color="#fff4d6"
            emissive="#f6d69a"
            emissiveIntensity={seeded(index, wx + side) > 0.45 ? 0.9 : 0.15}
          />
        </mesh>
      ))}
      {/* front porch column */}
      <mesh position={[1.5, 0.75, 1.2]}>
        <boxGeometry args={[0.14, 1.5, 0.14]} />
        <meshStandardMaterial color="#ffffff" roughness={0.8} />
      </mesh>
    </group>
  );
}

function PalmTree({ index }: { index: number }) {
  const side = index % 2 === 0 ? 1 : -1;
  const z = -index * HOUSE_SPACING - 3;
  const lean = (seeded(index, 41) - 0.5) * 0.24;
  return (
    <group position={[side * 2.9, 0, z]} rotation={[0, 0, lean]}>
      <mesh position={[0, 1.15, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.12, 2.3, 6]} />
        <meshStandardMaterial color="#7a5a3a" roughness={0.9} />
      </mesh>
      {Array.from({ length: 6 }, (_, leaf) => (
        <mesh
          key={leaf}
          position={[0, 2.3, 0]}
          rotation={[0.6 + seeded(index, leaf) * 0.25, (leaf / 6) * Math.PI * 2, 0]}
        >
          <coneGeometry args={[0.09, 1.5, 4]} />
          <meshStandardMaterial color="#3f7d44" roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function Street({ progress }: { progress: { get: () => number } }) {
  const houses = useMemo(() => Array.from({ length: Math.floor(STREET_LENGTH / HOUSE_SPACING) + 2 }, (_, i) => i), []);
  const palms = useMemo(() => Array.from({ length: 10 }, (_, i) => i * 2 + 1), []);
  const dashes = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);

  useFrame(({ camera }) => {
    const p = THREE.MathUtils.clamp(progress.get(), 0, 1);
    const z = 4 - p * (STREET_LENGTH - 10);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, z, 0.08);
    camera.position.x = Math.sin(p * Math.PI * 3) * 0.5;
    camera.position.y = 1.7 + Math.sin(p * Math.PI * 6) * 0.05;
    camera.lookAt(camera.position.x * 0.4, 1.5, camera.position.z - 12);
  });

  return (
    <group>
      {/* road */}
      <mesh position={[0, 0, -STREET_LENGTH / 2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[5, STREET_LENGTH + 30]} />
        <meshStandardMaterial color="#3b4048" roughness={0.95} />
      </mesh>
      {/* grass verges */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 5.4, -0.01, -STREET_LENGTH / 2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[6, STREET_LENGTH + 30]} />
          <meshStandardMaterial color="#8fae7e" roughness={1} />
        </mesh>
      ))}
      {/* centre dashes */}
      {dashes.map((dash) => (
        <mesh key={dash} position={[0, 0.01, -dash * 4 - 1]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.14, 1.6]} />
          <meshStandardMaterial color="#e8e4d8" roughness={0.8} />
        </mesh>
      ))}
      {houses.map((index) => (
        <group key={index}>
          <TerraceHouse index={index} side={1} />
          <TerraceHouse index={index} side={-1} />
        </group>
      ))}
      {palms.map((index) => (
        <PalmTree key={index} index={index} />
      ))}
    </group>
  );
}

export default function StreetRide() {
  const wrapper = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: wrapper, offset: ["start start", "end end"] });

  return (
    <div ref={wrapper} className="relative h-[300vh]" aria-hidden>
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <Canvas shadows dpr={[1, 1.6]} gl={{ antialias: true }}>
          <PerspectiveCamera makeDefault position={[0, 1.7, 4]} fov={58} />
          <ambientLight intensity={0.85} />
          <directionalLight position={[6, 10, 4]} intensity={1.9} castShadow />
          <fog attach="fog" args={["#dfe9f2", 18, 46]} />
          <color attach="background" args={["#dfe9f2"]} />
          <Street progress={scrollYProgress} />
          <Environment preset="dawn" />
        </Canvas>

        <div className="pointer-events-none absolute inset-x-0 top-10 text-center">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-600">Taman RealityGenius</p>
          <h3 className="mt-2 text-3xl font-black tracking-[-0.04em] text-slate-900 md:text-5xl">
            Ride through the neighbourhood
          </h3>
          <p className="mx-auto mt-3 max-w-xl px-4 text-sm font-bold text-slate-600 md:text-base">
            Keep scrolling to cruise past Malaysian terrace homes — then explore the real ones waiting on RealityGenius.
          </p>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-8 flex justify-center">
          <span className="rounded-full bg-slate-950/80 px-5 py-3 text-sm font-black text-white backdrop-blur-xl">
            Scroll to drive down the street
          </span>
        </div>
      </div>
    </div>
  );
}
