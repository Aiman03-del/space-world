"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { MathUtils,Mesh,Vector3 } from "three";
import { useExperience } from "@/store/useExperience";
import SpaceEnvironment from "./SpaceEnvironment";
import { astronautState } from "@/store/astronautState";
const START_Z = 30;
const END_Z = 6;
const FOLLOW_OFFSET = new Vector3(0, 1.5, 9);
const desired = new Vector3();
const lookTarget = new Vector3();

function CameraRig() {
  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const { introProgress, introDone, scrollProgress } = useExperience.getState();

    if (!introDone) {
      // সিনেমাটিক ইন্ট্রো: ক্যামেরা সামনে এগোয়
      state.camera.position.z = START_Z + (END_Z - START_Z) * introProgress;
      state.camera.position.x = MathUtils.lerp(state.camera.position.x, state.pointer.x * 0.4, 0.04);
      state.camera.position.y = MathUtils.lerp(state.camera.position.y, state.pointer.y * 0.25, 0.04);
      state.camera.lookAt(0, 0, 0);
      return;
    }

    // গেম ক্যামেরা: অ্যাস্ট্রোনটকে স্মুথলি ফলো
    const { position } = astronautState;
    desired.copy(position).add(FOLLOW_OFFSET);
    desired.z -= scrollProgress * 3;

    const t = 1 - Math.exp(-3 * delta);
    state.camera.position.lerp(desired, t);

    lookTarget.set(position.x, position.y, position.z);
    state.camera.lookAt(lookTarget);
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