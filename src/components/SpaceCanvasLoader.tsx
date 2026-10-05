"use client";

import dynamic from "next/dynamic";

const SpaceCanvas = dynamic(() => import("./space/SpaceCanvas"), { ssr: false });

export default function SpaceCanvasLoader() {
  return <SpaceCanvas />;
}