import { useEffect, useRef } from "react";

export type ArrowKeys = {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
};

const KEY_MAP: Record<string, keyof ArrowKeys> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
};

// state নয়, ref ফেরত দেয়, তাই useFrame-এ পড়লে re-render হয় না
export function useArrowKeys() {
  const keys = useRef<ArrowKeys>({
    up: false,
    down: false,
    left: false,
    right: false,
  });

  useEffect(() => {
    const set = (event: KeyboardEvent, pressed: boolean) => {
      const key = KEY_MAP[event.key];
      if (!key) return;
      event.preventDefault(); // তীর কী দিয়ে পেজ স্ক্রল বন্ধ
      keys.current[key] = pressed;
    };

    const onDown = (e: KeyboardEvent) => set(e, true);
    const onUp = (e: KeyboardEvent) => set(e, false);
    const onBlur = () => {
      keys.current = { up: false, down: false, left: false, right: false };
    };

    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    window.addEventListener("blur", onBlur);

    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

  return keys;
}