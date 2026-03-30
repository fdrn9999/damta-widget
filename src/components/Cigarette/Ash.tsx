interface AshProps {
  height: number;
}

export function Ash({ height }: AshProps) {
  if (height <= 0) return null;

  return (
    <div
      className="ash-gradient rounded-t-[30px] w-full transition-all duration-1000"
      style={{
        height: `${height}px`,
        willChange: "height",
      }}
    />
  );
}
