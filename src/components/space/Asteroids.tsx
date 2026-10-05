"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { MathUtils } from "three";
import type { Group } from "three";
import { useArrowKeys } from "@/hooks/useArrowKeys";
import { useExperience } from "@/store/useExperience";
import { astronautState } from "@/store/astronautState";
import AstronautModel from "./AstronautModel";

const USE_MODEL = true;

const ACCELERATION = 26;
const DAMPING = 2.4; // বেশি হলে তাড়াতাড়ি থামে
const MAX_SPEED = 7;
const BOUNDS = { x: 14, y: 8 };

function PlaceholderAstronaut() {
  return (
    <group>
      <mesh position={[0, 0.9, 0]}>
        <sphereGeometry args={[0.45, 24, 24]} />
        <meshStandardMaterial color="#f2f4ff" roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.9, 0.3]}>
        <sphereGeometry args={[0.3, 24, 24]} />
        <meshStandardMaterial color="#10162e" metalness={0.8} roughness={0.15} />
      </mesh>
      <mesh>
        <capsuleGeometry args={[0.4, 0.7, 8, 16]} />
        <meshStandardMaterial color="#e8ebf7" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0, -0.45]}>
        <boxGeometry args={[0.6, 0.8, 0.3]} />
        <meshStandardMaterial color="#b9c0d8" roughness={0.6} />
      </mesh>
    </group>
  );
}

export default function Astronaut() {
  const rootRef = useRef<Group>(null);
  const tiltRef = useRef<Group>(null);
  const keys = useArrowKeys();

  useFrame((_, rawDelta) => {
    const root = rootRef.current;
    const tilt = tiltRef.current;
    if (!root || !tilt) return;

    const delta = Math.min(rawDelta, 0.05); // ট্যাব সুইচের পর লাফ আটকায়
    const { introDone } = useExperience.getState();
    const { position, velocity } = astronautState;
    const k = keys.current;

    // ইন্ট্রো শেষ হলেই ইনপুট কাজ করবে
    const inputX = introDone ? Number(k.right) - Number(k.left) : 0;
    const inputY = introDone ? Number(k.up) - Number(k.down) : 0;

    velocity.x += inputX * ACCELERATION * delta;
    velocity.y += inputY * ACCELERATION * delta;

    // frame-rate independent damping
    const damp = Math.exp(-DAMPING * delta);
    velocity.x *= damp;
    velocity.y *= damp;

    const speed = Math.hypot(velocity.x, velocity.y);
    if (speed > MAX_SPEED) {
      velocity.x = (velocity.x / speed) * MAX_SPEED;
      velocity.y = (velocity.y / speed) * MAX_SPEED;
    }

    position.x += velocity.x * delta;
    position.y += velocity.y * delta;

    // সীমানা: আটকে দিন এবং দেয়ালের দিকের velocity শূন্য করুন
    if (Math.abs(position.x) > BOUNDS.x) {
      position.x = Math.sign(position.x) * BOUNDS.x;
      velocity.x = 0;
    }
    if (Math.abs(position.y) > BOUNDS.y) {
      position.y = Math.sign(position.y) * BOUNDS.y;
      velocity.y = 0;
    }

    root.position.copy(position);

    // মুভমেন্টের দিকে স্মুথলি ঘোরানো
    const targetYaw = MathUtils.clamp(velocity.x * 0.18, -1.0, 1.0);
    const targetPitch = MathUtils.clamp(-velocity.y * 0.12, -0.7, 0.7);
    const targetRoll = MathUtils.clamp(-velocity.x * 0.08, -0.5, 0.5);
    const t = 1 - Math.exp(-6 * delta);

    tilt.rotation.y = MathUtils.lerp(tilt.rotation.y, targetYaw, t);
    tilt.rotation.x = MathUtils.lerp(tilt.rotation.x, targetPitch, t);
    tilt.rotation.z = MathUtils.lerp(tilt.rotation.z, targetRoll, t);
  });

  return (
    <group ref={rootRef}>
      <group ref={tiltRef}>
        <Float speed={1.6} rotationIntensity={0.25} floatIntensity={0.6}>
          {USE_MODEL ? <AstronautModel /> : <PlaceholderAstronaut />}
        </Float>
      </group>
    </group>
  );
}