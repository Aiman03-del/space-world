"use client";

import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import type { Mesh, MeshStandardMaterial } from "three";
import { astronautState } from "@/store/astronautState";

const MODEL_PATH = "/models/astronaut.glb";
const MODEL_SCALE = 1;

const uniforms = {
  uPhase: { value: 0 },
  uArm: { value: 0.3 },
  uLeg: { value: 0.15 },
};

// ভার্টেক্স শেডার ইনজেকশন: হাড় ছাড়াই হাত-পায়ে "সফট স্কিনিং"
const LIMB_GLSL = /* glsl */ `
  #include <begin_vertex>

  vec3 lp = transformed;
  float side = lp.x >= 0.0 ? 1.0 : -1.0;
  float ax = abs(lp.x);
  vec3 delta = vec3(0.0);

  // ---- হাত ----
  vec3 shoulder = vec3(0.30, 0.52, 0.0);
  vec3 hand = vec3(0.45, 0.02, 0.0);
  vec3 armDir = hand - shoulder;
  vec3 pa = vec3(ax, lp.y, lp.z);
  float tArm = clamp(dot(pa - shoulder, armDir) / dot(armDir, armDir), 0.0, 1.0);
  float armDist = length(pa - (shoulder + armDir * tArm));
  float wArm = smoothstep(0.05, 0.35, tArm)
             * (1.0 - smoothstep(0.14, 0.24, armDist))
             * smoothstep(0.20, 0.30, ax);

  float armPhase = uPhase + (side > 0.0 ? 0.0 : 3.14159265);
  float armX = sin(armPhase) * uArm * wArm;
  float armZ = -side * (0.5 + 0.5 * sin(armPhase * 0.5)) * 0.12 * wArm;
  vec3 pivot = vec3(side * shoulder.x, shoulder.y, 0.0);
  vec3 q = lp - pivot;
  q = vec3(q.x, q.y * cos(armX) - q.z * sin(armX), q.y * sin(armX) + q.z * cos(armX));
  q = vec3(q.x * cos(armZ) - q.y * sin(armZ), q.x * sin(armZ) + q.y * cos(armZ), q.z);
  delta += (q + pivot) - lp;

  // ---- পা ----
  float wLeg = 1.0 - smoothstep(-0.15, 0.08, lp.y);
  for (int i = 0; i < 2; i++) {
    float sd = i == 0 ? 1.0 : -1.0;
    float w = wLeg * smoothstep(-0.04, 0.04, lp.x * sd);
    float legPhase = uPhase + (sd > 0.0 ? 3.14159265 : 0.0);
    float a = sin(legPhase) * uLeg * w;
    vec3 hip = vec3(sd * 0.12, 0.0, 0.0);
    vec3 r = lp - hip;
    delta += vec3(
      0.0,
      r.y * cos(a) - r.z * sin(a) - r.y,
      r.y * sin(a) + r.z * cos(a) - r.z
    );
  }

  transformed += delta;
`;

export default function AstronautModel() {
  const { scene } = useGLTF(MODEL_PATH);

  const model = useMemo(() => {
    const root = scene.clone(true);
    root.traverse((obj) => {
      const mesh = obj as Mesh;
      if (!mesh.isMesh) return;

      const material = (mesh.material as MeshStandardMaterial).clone();
      material.onBeforeCompile = (shader) => {
        shader.uniforms.uPhase = uniforms.uPhase;
        shader.uniforms.uArm = uniforms.uArm;
        shader.uniforms.uLeg = uniforms.uLeg;
        shader.vertexShader =
          "uniform float uPhase;\nuniform float uArm;\nuniform float uLeg;\n" +
          shader.vertexShader.replace("#include <begin_vertex>", LIMB_GLSL);
      };
      material.customProgramCacheKey = () => "astronaut-limbs-v1";

      mesh.material = material;
      mesh.frustumCulled = false;
    });
    return root;
  }, [scene]);

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const speed = Math.hypot(astronautState.velocity.x, astronautState.velocity.y);

    // স্থির থাকলে ধীর ভাসার দুলুনি, চললে দ্রুত ও বড় নড়াচড়া
    uniforms.uPhase.value += delta * (1.3 + speed * 0.5);
    uniforms.uArm.value = 0.22 + Math.min(speed, 7) * 0.05;
    uniforms.uLeg.value = 0.1 + Math.min(speed, 7) * 0.025;
  });

  return <primitive object={model} scale={MODEL_SCALE} />;
}

useGLTF.preload(MODEL_PATH);