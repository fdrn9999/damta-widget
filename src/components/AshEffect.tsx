import { useState, useCallback } from "react";

interface AshParticle {
  id: number;
  tx: number;
  ty: number;
  r: number;
  s: number;
  width: number;
  height: number;
  x: number;
  y: number;
  color: string;
  delay: number;
}

export function useAshEffect() {
  const [particles, setParticles] = useState<AshParticle[]>([]);

  const triggerFlick = useCallback((ashHeight: number) => {
    const newParticles: AshParticle[] = [];
    const count = 25 + Math.floor(Math.random() * 12);
    const maxDelay = Math.min(ashHeight / 40, 1.2); // 재가 길수록 순차 딜레이 길게

    for (let i = 0; i < count; i++) {
      const gray = 80 + Math.floor(Math.random() * 100);
      // 재 높이 안에서 위치 — 위쪽이 먼저 떨어짐 (y가 작을수록 delay 작음)
      const yPos = Math.random() * Math.min(ashHeight, 80);
      const yRatio = yPos / Math.max(ashHeight, 1); // 0(위) ~ 1(아래)

      newParticles.push({
        id: Date.now() + i,
        tx: (Math.random() - 0.5) * 120,
        ty: 30 + Math.random() * 140,
        r: (Math.random() - 0.5) * 900,
        s: 0.1 + Math.random() * 0.4,
        width: 2 + Math.random() * 6,
        height: 1 + Math.random() * 3,
        x: 2 + Math.random() * 52,
        y: yPos,
        color: `rgb(${gray}, ${gray - 10}, ${gray - 20})`,
        // 위쪽(yRatio≈0)부터 떨어지고, 아래쪽은 늦게 → 풀풀 캐스케이드
        delay: yRatio * maxDelay + Math.random() * 0.15,
      });
    }
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 2500);
  }, []);

  return { particles, triggerFlick };
}

export function AshEffect({ particles }: { particles: AshParticle[] }) {
  if (particles.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible z-50">
      {particles.map(p => (
        <div
          key={p.id}
          className="ash-particle"
          style={{
            left: `${p.x}px`,
            top: `${p.y}px`,
            width: `${p.width}px`,
            height: `${p.height}px`,
            background: p.color,
            "--tx": `${p.tx}px`,
            "--ty": `${p.ty}px`,
            "--r": `${p.r}deg`,
            "--s": `${p.s}`,
            animationDelay: `${p.delay}s`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
