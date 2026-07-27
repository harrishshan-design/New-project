"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useScroll } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

/* Deterministic pseudo-random so the street renders identically every visit. */
function seeded(index: number, salt: number) {
  const value = Math.sin(index * 127.1 + salt * 311.7) * 43758.5453;
  return value - Math.floor(value);
}

const HOUSE_COLORS = ["#e8dfd2", "#d4dfd6", "#e1d4ca", "#d6d9cf", "#ddd2bc", "#ced9dc"];
const ACCENT_COLORS = ["#836553", "#5c7569", "#896c55", "#66747c", "#8a735e"];
const ROOF_COLORS = ["#75432f", "#674034", "#80523b", "#5b4036"];
const CAR_COLORS = ["#ecebe6", "#b9c1c7", "#39434b", "#7b2528", "#d6c7a9"];
const STREET_LENGTH = 96;
const HOUSE_SPACING = 5.4;

function TerraceHouse({ index, side }: { index: number; side: 1 | -1 }) {
  const bodyColor = HOUSE_COLORS[Math.floor(seeded(index, side + 5) * HOUSE_COLORS.length)];
  const accentColor = ACCENT_COLORS[Math.floor(seeded(index, side + 9) * ACCENT_COLORS.length)];
  const roofColor = ROOF_COLORS[Math.floor(seeded(index, side + 13) * ROOF_COLORS.length)];
  const lightsOn = seeded(index, side + 21) > 0.38;
  const z = -index * HOUSE_SPACING - 6;
  const x = side * 7;

  return (
    <group position={[x, 0, z]} rotation={[0, side === 1 ? -Math.PI / 2 : Math.PI / 2, 0]}>
      <mesh position={[0, 1.55, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.85, 3.1, 3.15]} />
        <meshStandardMaterial color={bodyColor} roughness={0.9} />
      </mesh>

      <mesh position={[0, 3.55, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[3.25, 1.08, 4]} />
        <meshStandardMaterial color={roofColor} roughness={0.94} />
      </mesh>

      <mesh position={[1.1, 1.63, 1.59]}>
        <planeGeometry args={[1.3, 2.75]} />
        <meshStandardMaterial color={accentColor} roughness={0.84} />
      </mesh>

      <mesh position={[-1.45, 0.58, 1.61]}>
        <planeGeometry args={[0.74, 1.16]} />
        <meshStandardMaterial color="#49382e" roughness={0.68} />
      </mesh>

      {[[-0.35, 0.85], [-1.25, 2.22], [0.55, 2.22]].map(([wx, wy], windowIndex) => (
        <mesh key={windowIndex} position={[wx, wy, 1.615]}>
          <planeGeometry args={[windowIndex === 0 ? 1.05 : 0.9, 0.68]} />
          <meshStandardMaterial
            color={lightsOn ? "#ffe4a8" : "#78909a"}
            emissive={lightsOn ? "#f4bd68" : "#23343b"}
            emissiveIntensity={lightsOn ? 0.55 : 0.08}
            roughness={0.25}
          />
        </mesh>
      ))}

      <mesh position={[0, 2.16, 2.22]} castShadow>
        <boxGeometry args={[4.55, 0.12, 1.42]} />
        <meshStandardMaterial color="#494b49" roughness={0.78} />
      </mesh>
      {[-2.05, 2.05].map((columnX) => (
        <mesh key={columnX} position={[columnX, 1.08, 2.73]}>
          <boxGeometry args={[0.12, 2.16, 0.12]} />
          <meshStandardMaterial color="#d9d5cc" roughness={0.9} />
        </mesh>
      ))}

      <mesh position={[0, 0.34, 3.22]}>
        <boxGeometry args={[4.5, 0.56, 0.045]} />
        <meshStandardMaterial color="#343b3c" transparent opacity={0.34} roughness={0.65} />
      </mesh>
      <mesh position={[1.82, 2.35, 1.64]}>
        <boxGeometry args={[0.56, 0.38, 0.18]} />
        <meshStandardMaterial color="#e5e3dc" roughness={0.9} />
      </mesh>

      <mesh position={[0, 0.015, 2.62]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[4.8, 2]} />
        <meshStandardMaterial color="#92928b" roughness={1} />
      </mesh>
    </group>
  );
}

function TropicalTree({ index, palm = false }: { index: number; palm?: boolean }) {
  const side = index % 2 === 0 ? 1 : -1;
  const z = -index * HOUSE_SPACING - 2.7;
  const x = side * (palm ? 4.15 : 5.15);
  const height = palm ? 3.4 : 2.7 + seeded(index, 31) * 0.7;
  const leafColor = seeded(index, 33) > 0.5 ? "#2f6b47" : "#3f7a4f";

  if (palm) {
    return (
      <group position={[x, 0, z]} rotation={[0, 0, (seeded(index, 41) - 0.5) * 0.13]}>
        <mesh position={[0, height / 2, 0]} castShadow>
          <cylinderGeometry args={[0.07, 0.14, height, 7]} />
          <meshStandardMaterial color="#795b3e" roughness={0.94} />
        </mesh>
        {Array.from({ length: 7 }, (_, leaf) => (
          <mesh
            key={leaf}
            position={[0, height, 0]}
            rotation={[0.7, (leaf / 7) * Math.PI * 2, 0]}
          >
            <coneGeometry args={[0.12, 1.65, 4]} />
            <meshStandardMaterial color={leafColor} roughness={0.88} />
          </mesh>
        ))}
      </group>
    );
  }

  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, height / 2, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.22, height, 7]} />
        <meshStandardMaterial color="#684c36" roughness={1} />
      </mesh>
      <mesh position={[0, height, 0]} castShadow>
        <icosahedronGeometry args={[1.05, 1]} />
        <meshStandardMaterial color={leafColor} roughness={0.96} />
      </mesh>
      <mesh position={[0.7, height - 0.15, 0.15]} castShadow>
        <icosahedronGeometry args={[0.72, 1]} />
        <meshStandardMaterial color="#367349" roughness={0.96} />
      </mesh>
    </group>
  );
}

function CompactCar({ index, side, z }: { index: number; side: 1 | -1; z: number }) {
  const color = CAR_COLORS[Math.floor(seeded(index, side + 52) * CAR_COLORS.length)];
  return (
    <group position={[side * 4.65, 0.25, z]} rotation={[0, side === 1 ? 0.07 : Math.PI - 0.07, 0]}>
      <mesh position={[0, 0.28, 0]} castShadow>
        <boxGeometry args={[1.46, 0.5, 2.75]} />
        <meshStandardMaterial color={color} roughness={0.56} metalness={0.12} />
      </mesh>
      <mesh position={[0, 0.68, -0.12]} castShadow>
        <boxGeometry args={[1.22, 0.5, 1.5]} />
        <meshStandardMaterial color="#75858b" roughness={0.28} metalness={0.16} />
      </mesh>
      {[[-0.73, -0.84], [0.73, -0.84], [-0.73, 0.84], [0.73, 0.84]].map(([wheelX, wheelZ], wheelIndex) => (
        <mesh key={wheelIndex} position={[wheelX, 0.12, wheelZ]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.22, 0.22, 0.12, 10]} />
          <meshStandardMaterial color="#1e2325" roughness={0.94} />
        </mesh>
      ))}
      <mesh position={[0, -0.21, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.25, 18]} />
        <meshBasicMaterial color="#172022" transparent opacity={0.2} depthWrite={false} />
      </mesh>
    </group>
  );
}

function StreetLight({ side, z }: { side: 1 | -1; z: number }) {
  return (
    <group position={[side * 3.62, 0, z]}>
      <mesh position={[0, 2.15, 0]}>
        <cylinderGeometry args={[0.045, 0.075, 4.3, 7]} />
        <meshStandardMaterial color="#495354" roughness={0.72} />
      </mesh>
      <mesh position={[-side * 0.28, 4.24, 0]} rotation={[0, 0, side * 0.55]}>
        <boxGeometry args={[0.58, 0.06, 0.08]} />
        <meshStandardMaterial color="#495354" roughness={0.72} />
      </mesh>
      <mesh position={[-side * 0.49, 4.05, 0]}>
        <sphereGeometry args={[0.11, 10, 7]} />
        <meshStandardMaterial color="#ffe1a0" emissive="#ffbf61" emissiveIntensity={1.2} />
      </mesh>
    </group>
  );
}

function RoadSign() {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 160;
    const context = canvas.getContext("2d");
    if (context) {
      context.fillStyle = "#155e53";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.strokeStyle = "#f4f0df";
      context.lineWidth = 12;
      context.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
      context.fillStyle = "#ffffff";
      context.font = "bold 58px Arial";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText("JALAN RG 1", canvas.width / 2, canvas.height / 2);
    }
    const nextTexture = new THREE.CanvasTexture(canvas);
    nextTexture.colorSpace = THREE.SRGBColorSpace;
    return nextTexture;
  }, []);

  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <group position={[-3.88, 0, -9]} rotation={[0, 0.12, 0]}>
      <mesh position={[0, 1.35, 0]}>
        <cylinderGeometry args={[0.04, 0.06, 2.7, 7]} />
        <meshStandardMaterial color="#596263" roughness={0.8} />
      </mesh>
      <mesh position={[0.64, 2.58, 0]}>
        <planeGeometry args={[1.55, 0.5]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Street({ progress }: { progress: { get: () => number } }) {
  const { camera, size } = useThree();
  const compact = size.width < 640;
  const houses = useMemo(() => Array.from({ length: Math.floor(STREET_LENGTH / HOUSE_SPACING) + 2 }, (_, i) => i), []);
  const trees = useMemo(() => Array.from({ length: 14 }, (_, i) => i + 1), []);
  const drainCovers = useMemo(() => Array.from({ length: 34 }, (_, i) => i), []);
  const lamps = useMemo(() => Array.from({ length: 8 }, (_, i) => i), []);
  const cars = useMemo(() => [
    { index: 1, side: 1 as const, z: -13 },
    { index: 2, side: -1 as const, z: -28 },
    { index: 3, side: 1 as const, z: -47 },
    { index: 4, side: -1 as const, z: -68 },
    { index: 5, side: 1 as const, z: -82 }
  ], []);

  useEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return;
    camera.fov = compact ? 76 : 56;
    camera.updateProjectionMatrix();
  }, [camera, compact]);

  useFrame(({ camera }) => {
    const p = THREE.MathUtils.clamp(progress.get(), 0, 1);
    const z = 4 - p * (STREET_LENGTH - 10);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, z, 0.075);
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, Math.sin(p * Math.PI * 3) * 0.42, 0.09);
    camera.position.y = 1.74 + Math.sin(p * Math.PI * 6) * 0.035;
    camera.rotation.z = Math.sin(p * Math.PI * 3) * -0.006;
    camera.lookAt(camera.position.x * 0.35, 1.5, camera.position.z - 13);
  });

  return (
    <group scale={[compact ? 0.66 : 1, 1, 1]}>
      <mesh position={[0, -0.025, -STREET_LENGTH / 2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[7.1, STREET_LENGTH + 30]} />
        <meshStandardMaterial color="#3f4748" roughness={0.58} metalness={0.04} />
      </mesh>

      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[side * 6.45, -0.04, -STREET_LENGTH / 2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[5.8, STREET_LENGTH + 30]} />
            <meshStandardMaterial color="#54744f" roughness={1} />
          </mesh>
          <mesh position={[side * 3.68, 0.015, -STREET_LENGTH / 2]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.34, STREET_LENGTH + 30]} />
            <meshStandardMaterial color="#2c3635" roughness={0.92} />
          </mesh>
        </group>
      ))}

      {[-1, 1].flatMap((side) =>
        drainCovers.map((cover) => (
          <mesh key={`${side}-${cover}`} position={[side * 3.69, 0.028, -cover * 3.05 + 2]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.43, 1.8]} />
            <meshStandardMaterial color="#8f928c" roughness={0.98} />
          </mesh>
        ))
      )}

      {[-22, -58].map((z) => (
        <group key={z} position={[0, 0.035, z]}>
          {[-2.8, -1.9, -1, -0.1, 0.8, 1.7, 2.6].map((x, stripeIndex) => (
            <mesh key={x} position={[x, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.62, 0.68]} />
              <meshStandardMaterial color={stripeIndex % 2 ? "#1e2626" : "#e2b52f"} roughness={0.8} />
            </mesh>
          ))}
        </group>
      ))}

      {[-15, -39, -73].map((z, puddleIndex) => (
        <mesh key={z} position={[puddleIndex % 2 ? -1.55 : 1.5, 0.012, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.78 + puddleIndex * 0.12, 20]} />
          <meshStandardMaterial color="#71888a" transparent opacity={0.28} roughness={0.18} depthWrite={false} />
        </mesh>
      ))}

      {houses.map((index) => (
        <group key={index}>
          <TerraceHouse index={index} side={1} />
          <TerraceHouse index={index} side={-1} />
        </group>
      ))}
      {trees.map((index) => (
        <TropicalTree key={index} index={index} palm={index % 3 === 0} />
      ))}
      {lamps.flatMap((lamp) => [
        <StreetLight key={`left-${lamp}`} side={-1} z={-lamp * 13 - 5} />,
        <StreetLight key={`right-${lamp}`} side={1} z={-lamp * 13 - 11} />
      ])}
      {cars.map((car) => (
        <CompactCar key={car.index} {...car} />
      ))}
      <RoadSign />
    </group>
  );
}

export default function StreetRide() {
  const wrapper = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const { scrollYProgress } = useScroll({ target: wrapper, offset: ["start start", "end end"] });

  useEffect(() => {
    const node = wrapper.current;
    if (!node || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), { rootMargin: "180px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={wrapper} className="relative h-[300vh]" aria-label="Animated Malaysian neighbourhood tour">
      <div className="sticky top-[69px] h-[calc(100svh-69px)] w-full overflow-hidden">
        <Canvas
          frameloop={active ? "always" : "never"}
          dpr={[1, 1.25]}
          camera={{ position: [0, 1.74, 4], fov: 56 }}
          gl={{ antialias: true, powerPreference: "high-performance" }}
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.05;
          }}
        >
          <ambientLight intensity={0.52} />
          <hemisphereLight args={["#d8eef1", "#38563d", 0.78]} />
          <directionalLight position={[-7, 11, 5]} color="#ffd3a0" intensity={2.35} />
          <fog attach="fog" args={["#a8c3c4", 29, 72]} />
          <color attach="background" args={["#91b7bd"]} />
          <Street progress={scrollYProgress} />
        </Canvas>

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-950/20 via-transparent to-slate-950/30" />
        <div className="pointer-events-none absolute inset-x-0 top-24 px-4 text-center md:top-24">
          <p className="mx-auto w-fit rounded-full border border-white/40 bg-white/75 px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-emerald-900 shadow-lg backdrop-blur-xl md:text-xs">
            Taman RealityGenius / Selangor
          </p>
          <h3 className="mt-3 text-3xl font-black tracking-[-0.04em] text-white drop-shadow-[0_2px_14px_rgba(15,23,42,0.55)] md:text-5xl">
            Ride through a Malaysian neighbourhood
          </h3>
          <p className="mx-auto mt-3 max-w-xl px-4 text-sm font-bold text-white drop-shadow-[0_2px_10px_rgba(15,23,42,0.7)] md:text-base">
            Cruise past tropical greenery, terrace homes and familiar taman streets - then explore real homes on RealityGenius.
          </p>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-8 flex justify-center">
          <span className="rounded-full border border-white/20 bg-slate-950/75 px-5 py-3 text-sm font-black text-white shadow-2xl backdrop-blur-xl">
            Scroll to cruise down Jalan RG 1
          </span>
        </div>
      </div>
    </div>
  );
}
