"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, BackSide } from "three";
import type { Mesh, ShaderMaterial } from "three";

const vertexShader = /* glsl */ `
  varying vec3 vDir;

  void main() {
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uIntensity;
  varying vec3 vDir;

  float hash(vec3 p) {
    p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3));
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  float noise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);

    return mix(
      mix(
        mix(hash(i + vec3(0.0, 0.0, 0.0)), hash(i + vec3(1.0, 0.0, 0.0)), f.x),
        mix(hash(i + vec3(0.0, 1.0, 0.0)), hash(i + vec3(1.0, 1.0, 0.0)), f.x),
        f.y
      ),
      mix(
        mix(hash(i + vec3(0.0, 0.0, 1.0)), hash(i + vec3(1.0, 0.0, 1.0)), f.x),
        mix(hash(i + vec3(0.0, 1.0, 1.0)), hash(i + vec3(1.0, 1.0, 1.0)), f.x),
        f.y
      ),
      f.z
    );
  }

  float fbm(vec3 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 4; i++) {
      value += amplitude * noise(p);
      p = p * 2.02 + vec3(1.7, 9.2, 3.1);
      amplitude *= 0.5;
    }
    return value;
  }

  void main() {
    vec3 p = vDir * 2.2 + vec3(uTime * 0.01, 0.0, uTime * 0.008);

    float shape = fbm(p);
    float tint = fbm(p * 1.7 + 11.0);

    float cloud = smoothstep(0.5, 0.85, shape);

    vec3 colorA = vec3(0.10, 0.18, 0.55);
    vec3 colorB = vec3(0.55, 0.12, 0.45);
    vec3 color = mix(colorA, colorB, smoothstep(0.3, 0.8, tint));

    gl_FragColor = vec4(color, cloud * uIntensity);
  }
`;

export default function Nebula() {
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      // Raise for a stronger nebula, lower for a subtler one
      uIntensity: { value: 0.45 },
    }),
    []
  );

  useFrame((state) => {
    const mesh = meshRef.current;
    const material = materialRef.current;
    if (!mesh || !material) return;

    mesh.position.copy(state.camera.position);
    material.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <mesh ref={meshRef} renderOrder={-1} frustumCulled={false}>
      <sphereGeometry args={[380, 48, 32]} />
      <shaderMaterial
        ref={materialRef}
        args={[
          {
            uniforms,
            vertexShader,
            fragmentShader,
            side: BackSide,
            transparent: true,
            depthWrite: false,
            blending: AdditiveBlending,
          },
        ]}
      />
    </mesh>
  );
}