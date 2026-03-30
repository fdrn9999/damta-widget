interface EmberProps {
  isActive: boolean;
  glowIntensity?: number;
}

export function Ember({ isActive, glowIntensity = 1 }: EmberProps) {
  return (
    <div
      className={`w-full h-2 bg-gradient-to-b from-red-600 via-orange-500 to-orange-300 ${
        isActive ? "ember-glow" : "ember-glow paused"
      }`}
      style={{
        filter: isActive
          ? `drop-shadow(0 0 ${8 * glowIntensity}px rgba(255,100,0,0.8)) drop-shadow(0 0 ${12 * glowIntensity}px rgba(255,50,0,0.6))`
          : undefined,
      }}
    />
  );
}
