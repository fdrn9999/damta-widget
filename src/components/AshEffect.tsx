import { useState, useCallback } from "react";

interface AshParticle {
  id: number;
  tx: number;
  ty: number;
  r: number;
  s: number;
  size: number;
  x: number;
}

export function useAshEffect() {
  const [particles, setParticles] = useState<AshParticle[]>([]);
  const [isFlicking, setIsFlicking] = useState(false);

  const triggerFlick = useCallback(() => {
    const newParticles: AshParticle[] = [];
    for (let i = 0; i < 12; i++) {
      newParticles.push({
        id: Date.now() + i,
        tx: (Math.random() - 0.5) * 80,
        ty: 40 + Math.random() * 80,
        r: (Math.random() - 0.5) * 720,
        s: 0.2 + Math.random() * 0.5,
        size: 3 + Math.random() * 5,
        x: 10 + Math.random() * 36,
      });
    }
    setParticles(newParticles);
    setIsFlicking(true);
    setTimeout(() => {
      setParticles([]);
      setIsFlicking(false);
    }, 1500);
  }, []);

  return { particles, isFlicking, triggerFlick };
}

export function AshEffect({ particles }: { particles: AshParticle[] }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible">
      {particles.map(p => (
        <div
          key={p.id}
          className="ash-particle"
          style={{
            left: `${p.x}px`,
            top: "50%",
            width: `${p.size}px`,
            height: `${p.size}px`,
            "--tx": `${p.tx}px`,
            "--ty": `${p.ty}px`,
            "--r": `${p.r}deg`,
            "--s": `${p.s}`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
