"use client";

import { Sparkles, Stars } from "@react-three/drei";
import Skybox from "./Skybox";
import Nebula from "./Nebula";
import Asteroids from "./Asteroids";

export default function SpaceEnvironment() {
  return (
    <>
      <Skybox />
      <Nebula />

      <Stars radius={150} depth={60} count={2500} factor={4} fade speed={0.6} />
      <Sparkles
        count={220}
        scale={[70, 45, 70]}
        size={2.2}
        speed={0.15}
        opacity={0.5}
        color="#9ab6ff"
      />

      <Asteroids />

      <ambientLight intensity={0.12} />
      <directionalLight position={[30, 20, 25]} intensity={3.5} color="#fff2e0" />
      <directionalLight position={[-25, -8, -20]} intensity={0.8} color="#4a6cff" />
    </>
  );
}