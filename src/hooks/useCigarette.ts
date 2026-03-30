import { useState, useCallback, useRef } from "react";

export function useCigarette(progress: number, isActive: boolean) {
  const maxPaperHeight = 240;
  const maxAshHeight = 80;
  const [isLit, setIsLit] = useState(false);
  const lastFlickProgressRef = useRef(0);

  const paperHeight = maxPaperHeight * (1 - progress);

  // Ash accumulates from the last flick point
  const ashProgress = progress - lastFlickProgressRef.current;
  const ashHeight = isActive && isLit ? Math.max(0, Math.min(ashProgress * maxAshHeight * (1 / (1 - lastFlickProgressRef.current || 1)), maxAshHeight)) : 0;

  const lightUp = useCallback(() => {
    setIsLit(true);
    lastFlickProgressRef.current = 0;
  }, []);

  const flickAsh = useCallback(() => {
    const hadAsh = ashHeight > 5;
    lastFlickProgressRef.current = progress;
    return hadAsh;
  }, [ashHeight, progress]);

  const resetCigarette = useCallback(() => {
    setIsLit(false);
    lastFlickProgressRef.current = 0;
  }, []);

  return {
    ashHeight,
    paperHeight,
    isLit,
    maxPaperHeight,
    lightUp,
    flickAsh,
    resetCigarette,
  };
}
