"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { BackSide, SRGBColorSpace } from "three";
import type { Mesh } from "three";
import { useExperience } from "@/store/useExperience";

// Change this path to a 4K version later if you want a lighter mobile build
const SKYBOX_PATH = "/textures/milkyway-8k.jpg";
// Lower the tint value to darken the sky, raise it towards #ffffff to brighten
const SKYBOX_TINT = "#cfcfcf";

export default function Skybox() {
  const meshRef = useRef<Mesh>(null);
  const texture = useTexture(SKYBOX_PATH);
  const setSceneReady = useExperience((s) => s.setSceneReady);

  useEffect(() => {
    texture.colorSpace = SRGBColorSpace;
    texture.needsUpdate = true;
    setSceneReady(true);
  }, [texture, setSceneReady]);

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    // Keep the sky centered on the camera so it always feels infinitely far
    mesh.position.copy(state.camera.position);
    mesh.rotation.y += delta * 0.004;
  });

  return (
    <mesh ref={meshRef} renderOrder={-2} frustumCulled={false}>
      <sphereGeometry args={[400, 64, 48]} />
      <meshBasicMaterial
        map={texture}
        side={BackSide}
        color={SKYBOX_TINT}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}