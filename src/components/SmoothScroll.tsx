"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { useExperience } from "@/store/useExperience";

export default function SmoothScroll() {
  const setScrollProgress = useExperience((s) => s.setScrollProgress);

  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.08 });

    lenis.on("scroll", (e: { progress: number }) => {
      setScrollProgress(e.progress);
    });

    let frameId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    };
    frameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frameId);
      lenis.destroy();
    };
  }, [setScrollProgress]);

  return null;
}