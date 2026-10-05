"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useExperience } from "@/store/useExperience";

const TITLE = "SPACE WORLD";
const SUBTITLE = "A journey beyond the horizon";

export default function Intro() {
  const rootRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const setIntroDone = useExperience((s) => s.setIntroDone);
  const setIntroProgress = useExperience((s) => s.setIntroProgress);
  const introDone = useExperience((s) => s.introDone);
  const sceneReady = useExperience((s) => s.sceneReady);
  const scrollProgress = useExperience((s) => s.scrollProgress);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const progress = { value: 0 };

      gsap.set(".intro-cover", { opacity: 1 });
      gsap.set(".intro-bar", { height: "50vh" });
      gsap.set(".intro-letter", { opacity: 0, y: 30, filter: "blur(12px)" });
      gsap.set(".intro-subtitle", { opacity: 0, y: 12 });
      gsap.set(".intro-scroll", { opacity: 0 });

      const tl = gsap.timeline({
        paused: true,
        onComplete: () => setIntroDone(true),
      });

      tl.to(
        progress,
        {
          value: 1,
          duration: 9.5,
          ease: "power2.inOut",
          onUpdate: () => setIntroProgress(progress.value),
        },
        0
      )
        .to(".intro-cover", { opacity: 0, duration: 2, ease: "power1.out" }, 0.3)
        .to(".intro-bar", { height: "11vh", duration: 2.5, ease: "power3.inOut" }, 0.8)
        .to(
          ".intro-letter",
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 1.4,
            stagger: 0.08,
            ease: "power3.out",
          },
          2.6
        )
        .to(
          ".intro-title",
          { letterSpacing: "0.45em", duration: 4, ease: "power1.out" },
          2.6
        )
        .to(".intro-subtitle", { opacity: 1, y: 0, duration: 1.4, ease: "power2.out" }, 5)
        .to(".intro-title-wrap", { opacity: 0, duration: 1.4, ease: "power2.in" }, 7.6)
        .to(".intro-bar", { height: 0, duration: 1.4, ease: "power3.inOut" }, 8)
        .to(".intro-scroll", { opacity: 1, duration: 1 }, 9);

      timelineRef.current = tl;
    }, root);

    return () => {
      ctx.revert();
      timelineRef.current = null;
    };
  }, [setIntroDone, setIntroProgress]);

  useEffect(() => {
    if (sceneReady) {
      timelineRef.current?.play();
    }
  }, [sceneReady]);

  const handleSkip = () => {
    timelineRef.current?.progress(1, false);
  };

  return (
    <div ref={rootRef} className="pointer-events-none fixed inset-0 z-50">
      <div className="intro-cover absolute inset-0 bg-black" />

      {!sceneReady && !introDone && (
        <div className="absolute inset-0 flex items-center justify-center text-xs tracking-[0.5em] text-white/40">
          LOADING
        </div>
      )}

      <div className="intro-bar absolute left-0 top-0 w-full bg-black" />
      <div className="intro-bar absolute bottom-0 left-0 w-full bg-black" />

      <div className="intro-title-wrap absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        <h1
          className="intro-title text-4xl font-light text-white md:text-7xl"
          style={{ letterSpacing: "0.15em" }}
        >
          {TITLE.split("").map((char, index) => (
            <span key={index} className="intro-letter inline-block">
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </h1>
        <p className="intro-subtitle mt-6 text-sm tracking-[0.35em] text-white/70 md:text-base">
          {SUBTITLE.toUpperCase()}
        </p>
      </div>

      <div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 transition-opacity duration-500"
        style={{ opacity: scrollProgress > 0.01 ? 0 : 1 }}
      >
        <div className="intro-scroll flex flex-col items-center gap-3 text-white/70">
          <span className="text-xs tracking-[0.4em]">SCROLL</span>
          <span className="block h-10 w-px bg-white/60" />
        </div>
      </div>

      {!introDone && (
        <button
          type="button"
          onClick={handleSkip}
          className="pointer-events-auto absolute bottom-6 right-6 text-xs tracking-[0.3em] text-white/50 transition-colors hover:text-white"
        >
          SKIP INTRO
        </button>
      )}
    </div>
  );
}