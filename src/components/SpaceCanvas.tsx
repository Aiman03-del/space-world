"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { useRef } from "react";
import type { Mesh } from "three";

function TestBox() {
  const ref = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.x += delta * 0.4;
      ref.current.rotation.y += delta * 0.6;
    }
  });

  return (
    <mesh ref={ref}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#8ab4ff" />
    </mesh>
  );
}

export default function SpaceCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 55 }}
      dpr={[1, 2]}
      gl={{ antialias: true }}
    >
      <color attach="background" args={["#000000"]} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={2} />
      <Stars radius={100} depth={50} count={4000} factor={4} fade speed={1} />
      <TestBox />
    </Canvas>
  );
}