"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, Euler, IcosahedronGeometry, Object3D, Vector3 } from "three";
import type { BufferGeometry, InstancedMesh } from "three";

const COUNT = 60;
const MIN_RADIUS = 14;
const MAX_RADIUS = 90;

type RockData = {
  position: Vector3;
  rotation: Euler;
  spin: Vector3;
  scale: number;
  tone: number;
};

function createRng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function createRockGeometry(): BufferGeometry {
  const geometry = new IcosahedronGeometry(1, 2);
  const positions = geometry.attributes.position;
  const vertex = new Vector3();

  for (let i = 0; i < positions.count; i++) {
    vertex.fromBufferAttribute(positions, i);

    // Deterministic displacement based on position, so shared vertices move together
    const bump =
      Math.sin(vertex.x * 3.1 + 1.3) * Math.cos(vertex.y * 2.7 + 0.4) +
      Math.sin(vertex.z * 4.3 + vertex.x * 1.9);

    vertex.multiplyScalar(1 + bump * 0.18);
    positions.setXYZ(i, vertex.x, vertex.y, vertex.z);
  }

  geometry.computeVertexNormals();
  return geometry;
}

function createRocks(): RockData[] {
  const rand = createRng(7);
  const rocks: RockData[] = [];

  for (let i = 0; i < COUNT; i++) {
    const theta = rand() * Math.PI * 2;
    const phi = Math.acos(2 * rand() - 1);
    const radius = MIN_RADIUS + rand() * (MAX_RADIUS - MIN_RADIUS);

    rocks.push({
      position: new Vector3(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi) * 0.6,
        radius * Math.sin(phi) * Math.sin(theta)
      ),
      rotation: new Euler(
        rand() * Math.PI * 2,
        rand() * Math.PI * 2,
        rand() * Math.PI * 2
      ),
      spin: new Vector3(
        (rand() - 0.5) * 0.12,
        (rand() - 0.5) * 0.12,
        (rand() - 0.5) * 0.12
      ),
      scale: 0.3 + Math.pow(rand(), 3) * 3.5,
      tone: 0.22 + rand() * 0.2,
    });
  }

  return rocks;
}

export default function Asteroids() {
  const meshRef = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const geometry = useMemo(() => createRockGeometry(), []);
  const rocks = useMemo(() => createRocks(), []);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const color = new Color();
    rocks.forEach((rock, index) => {
      color.setHSL(0.07, 0.15, rock.tone);
      mesh.setColorAt(index, color);
    });

    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true;
    }
  }, [rocks]);

  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const time = state.clock.elapsedTime;

    rocks.forEach((rock, index) => {
      dummy.position.copy(rock.position);
      dummy.rotation.set(
        rock.rotation.x + rock.spin.x * time,
        rock.rotation.y + rock.spin.y * time,
        rock.rotation.z + rock.spin.z * time
      );
      dummy.scale.setScalar(rock.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
    });

    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, undefined, COUNT]}
      frustumCulled={false}
    >
      <meshStandardMaterial
        color="#ffffff"
        roughness={0.95}
        metalness={0.05}
        flatShading
      />
    </instancedMesh>
  );
}