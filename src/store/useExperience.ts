import { create } from "zustand";

type ExperienceState = {
  scrollProgress: number;
  introProgress: number;
  introDone: boolean;
  sceneReady: boolean;
  setScrollProgress: (value: number) => void;
  setIntroProgress: (value: number) => void;
  setIntroDone: (value: boolean) => void;
  setSceneReady: (value: boolean) => void;
};

export const useExperience = create<ExperienceState>((set) => ({
  scrollProgress: 0,
  introProgress: 0,
  introDone: false,
  sceneReady: false,
  setScrollProgress: (value) => set({ scrollProgress: value }),
  setIntroProgress: (value) => set({ introProgress: value }),
  setIntroDone: (value) => set({ introDone: value }),
  setSceneReady: (value) => set({ sceneReady: value }),
}));