"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { MathUtils } from "three";
import type { Mesh } from "three";
import { useExperience } from "@/store/useExperience";
import SpaceEnvironment from "./SpaceEnvironment";

const START_Z = 30;
const END_Z = 6;

function CameraRig() {
  useFrame((state) => {
    const { introProgress, scrollProgress } = useExperience.getState();

    // Temporary scroll drift, it will be replaced by the game camera later
    const targetZ =
      START_Z + (END_Z - START_Z) * introProgress - scrollProgress * 3;

    state.camera.position.z = targetZ;
    state.camera.position.x = MathUtils.lerp(
      state.camera.position.x,
      state.pointer.x * 0.4,
      0.04
    );
    state.camera.position.y = MathUtils.lerp(
      state.camera.position.y,
      state.pointer.y * 0.25,
      0.04
    );
    state.camera.lookAt(0, 0, 0);
  });

  return null;
}

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
      <meshStandardMaterial color="#c9d6ff" metalness={0.6} roughness={0.35} />
    </mesh>
  );
}

export default function SpaceCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0, START_Z], fov: 55, near: 0.1, far: 1000 }}
      dpr={[1, 2]}
      gl={{ antialias: false }}
    >
      <color attach="background" args={["#000000"]} />

      <Suspense fallback={null}>
        <SpaceEnvironment />
        <TestBox />
      </Suspense>

      <CameraRig />

      <EffectComposer multisampling={0}>
        <Bloom intensity={0.6} luminanceThreshold={0.7} mipmapBlur />
        <Vignette eskil={false} offset={0.2} darkness={0.9} />
      </EffectComposer>
    </Canvas>
  );
}