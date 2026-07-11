"use client";

import { Environment, Float, MeshReflectorMaterial, PerspectiveCamera } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

function HouseModel() {
  const group = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!group.current) return;
    group.current.rotation.y = Math.sin(clock.elapsedTime * 0.45) * 0.055;
    group.current.rotation.x = Math.sin(clock.elapsedTime * 0.28) * 0.018;
  });

  return (
    <Float speed={1.2} rotationIntensity={0.25} floatIntensity={0.28}>
      <group ref={group} position={[0, -0.35, 0]}>
        <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.9, 1.8, 2.45]} />
          <meshStandardMaterial color="#9ca3af" roughness={0.48} metalness={0.18} />
        </mesh>
        <mesh position={[0, 1.22, -0.02]} castShadow>
          <boxGeometry args={[4.4, 0.18, 2.8]} />
          <meshStandardMaterial color="#1f2933" roughness={0.34} metalness={0.42} />
        </mesh>
        <mesh position={[0, 2.08, -0.15]} castShadow receiveShadow>
          <boxGeometry args={[3.15, 1.45, 2.15]} />
          <meshStandardMaterial color="#b8bec6" roughness={0.42} metalness={0.16} />
        </mesh>
        <mesh position={[0, 2.92, -0.15]} castShadow>
          <boxGeometry args={[3.65, 0.18, 2.52]} />
          <meshStandardMaterial color="#202832" roughness={0.32} metalness={0.45} />
        </mesh>

        {[-1.15, 0, 1.15].map((x) => (
          <mesh key={x} position={[x, 2.1, 0.96]}>
            <boxGeometry args={[0.78, 0.86, 0.04]} />
            <meshStandardMaterial emissive="#f6d69a" emissiveIntensity={1.8} color="#ffedd5" />
          </mesh>
        ))}
        {[-1.45, -0.45, 0.55, 1.45].map((x) => (
          <mesh key={x} position={[x, 0.12, 1.24]}>
            <boxGeometry args={[0.62, 1.15, 0.04]} />
            <meshStandardMaterial emissive="#f5c979" emissiveIntensity={1.35} color="#fde7b0" />
          </mesh>
        ))}

        <mesh position={[0, -0.92, 0.25]} receiveShadow>
          <boxGeometry args={[5.2, 0.16, 3.4]} />
          <meshStandardMaterial color="#15191f" roughness={0.26} metalness={0.2} />
        </mesh>
        <mesh position={[0, -1.04, 1.1]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[6, 2.4]} />
          <MeshReflectorMaterial
            blur={[500, 120]}
            resolution={512}
            mixBlur={0.85}
            mixStrength={1.3}
            roughness={0.78}
            depthScale={0.35}
            color="#0a1017"
            metalness={0.35}
          />
        </mesh>

        <pointLight position={[-2.6, 0.1, 2.2]} color="#f2c879" intensity={3} distance={5} />
        <pointLight position={[2.4, 1.2, 2.1]} color="#f6d69a" intensity={2.8} distance={5} />
      </group>
    </Float>
  );
}

export default function HeroHouse() {
  return (
    <div className="house-scene reflection h-[46vh] min-h-[360px] w-full lg:h-[72vh]">
      <Canvas shadows dpr={[1, 1.8]}>
        <PerspectiveCamera makeDefault position={[0, 2.4, 7.5]} fov={36} />
        <ambientLight intensity={0.7} />
        <directionalLight position={[4, 7, 5]} intensity={2.4} castShadow />
        <HouseModel />
        <Environment preset="night" />
      </Canvas>
    </div>
  );
}
