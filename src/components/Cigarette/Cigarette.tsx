import { Ash } from "./Ash";
import { Ember } from "./Ember";
import { Paper } from "./Paper";
import { Filter } from "./Filter";
import { SmokeParticles } from "./SmokeParticles";
import { SmokeParticle } from "../../hooks/useSmokeParticles";

interface CigaretteProps {
  ashHeight: number;
  paperHeight: number;
  isLit: boolean;
  isActive: boolean;
  skin?: "default" | "menthol" | "slim";
  smokeParticles: SmokeParticle[];
  emberGlow?: number;
  onFlickAsh?: () => void;
}

export function Cigarette({
  ashHeight,
  paperHeight,
  isLit,
  isActive,
  skin = "default",
  smokeParticles,
  emberGlow = 1,
  onFlickAsh,
}: CigaretteProps) {
  const width = skin === "slim" ? "w-10" : "w-14";

  return (
    <div className={`flex flex-col items-center ${width} relative ${!isLit ? "cigarette-unlit" : ""}`}>
      {/* Smoke */}
      {isLit && isActive && <SmokeParticles particles={smokeParticles} />}

      {/* Ash */}
      <Ash height={ashHeight} />

      {/* Ember */}
      {isLit && paperHeight > 0 && <Ember isActive={isActive} glowIntensity={emberGlow} />}

      {/* Paper */}
      <Paper height={paperHeight} skin={skin} />

      {/* Filter */}
      <Filter skin={skin} onDoubleClick={onFlickAsh} />
    </div>
  );
}
