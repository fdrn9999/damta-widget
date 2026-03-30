interface PaperProps {
  height: number;
  skin?: "default" | "menthol" | "slim";
}

export function Paper({ height, skin = "default" }: PaperProps) {
  if (height <= 0) return null;

  const widthClass = skin === "slim" ? "w-10" : "w-full";

  return (
    <div
      className={`paper-texture ${widthClass} self-center transition-all duration-1000`}
      style={{
        height: `${height}px`,
        willChange: "height",
      }}
    />
  );
}
