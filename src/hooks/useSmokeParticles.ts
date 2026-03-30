import { useState, useEffect, useRef, useCallback } from "react";

export interface SmokeParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  delay: number;
  duration: number;
  drift: number;
  r: number;
  g: number;
  b: number;
}

export function useSmokeParticles(isActive: boolean, amount: string) {
  const [particles, setParticles] = useState<SmokeParticle[]>([]);
  const idRef = useRef(0);
  const intervalRef = useRef<number | null>(null);

  const counts: Record<string, number> = { none: 0, low: 3, normal: 6, high: 10 };
  const maxParticles = counts[amount] || 6;
  const spawnInterval = amount === "high" ? 1200 : amount === "low" ? 3000 : 2000;

  const createParticle = useCallback((): SmokeParticle => {
    idRef.current += 1;
    return {
      id: idRef.current,
      x: 20 + Math.random() * 16,
      y: 0,
      size: 16 + Math.random() * 24,
      opacity: 0.08 + Math.random() * 0.12,
      delay: Math.random() * 0.5,
      duration: 4 + Math.random() * 4,
      drift: (Math.random() - 0.5) * 30,
      r: 200 + Math.floor(Math.random() * 55),
      g: 200 + Math.floor(Math.random() * 55),
      b: 200 + Math.floor(Math.random() * 55),
    };
  }, []);

  useEffect(() => {
    if (!isActive || amount === "none") {
      setParticles([]);
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    // Initial batch
    const initial: SmokeParticle[] = [];
    for (let i = 0; i < Math.min(3, maxParticles); i++) {
      initial.push(createParticle());
    }
    setParticles(initial);

    intervalRef.current = window.setInterval(() => {
      setParticles(prev => {
        const filtered = prev.length >= maxParticles ? prev.slice(1) : prev;
        return [...filtered, createParticle()];
      });
    }, spawnInterval);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, amount, maxParticles, spawnInterval, createParticle]);

  return particles;
}
