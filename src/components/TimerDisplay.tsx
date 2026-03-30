interface TimerDisplayProps {
  display: string;
  state: string;
}

export function TimerDisplay({ display, state }: TimerDisplayProps) {
  const stateLabel: Record<string, string> = {
    idle: "준비",
    running: "집중 중",
    paused: "일시정지",
    break: "휴식",
    longBreak: "긴 휴식",
  };

  return (
    <div className="flex flex-col items-center mt-1 select-none">
      <span className="font-mono text-[10px] text-gray-400 tracking-wider">
        {display}
      </span>
      <span className="text-[8px] text-gray-600">
        {stateLabel[state] || ""}
      </span>
    </div>
  );
}
