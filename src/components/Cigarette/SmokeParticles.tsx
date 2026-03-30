import { SmokeParticle } from "../../hooks/useSmokeParticles";

interface SmokeParticlesProps {
  particles: SmokeParticle[];
}

export function SmokeParticles({ particles }: SmokeParticlesProps) {
  return (
    <div className="absolute bottom-full left-0 right-0 h-[200px] pointer-events-none overflow-hidden">
      {particles.map(p => (
        <div
          key={p.id}
          className="smoke-particle"
          style={{
            left: `${p.x}px`,
            bottom: 0,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: `rgba(${p.r}, ${p.g}, ${p.b}, ${p.opacity})`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            transform: `translateX(${p.drift}px)`,
          }}
        />
      ))}
    </div>
  );
}
