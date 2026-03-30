import { getCurrentWindow } from "@tauri-apps/api/window";

interface FilterProps {
  skin?: "default" | "menthol" | "slim";
  onDoubleClick?: () => void;
}

export function Filter({ skin = "default", onDoubleClick }: FilterProps) {
  const handleMouseDown = async (e: React.MouseEvent) => {
    if (e.detail === 2) return; // skip drag on double click
    try {
      await getCurrentWindow().startDragging();
    } catch {
      // ignore errors when not in Tauri context
    }
  };

  const skinColors: Record<string, string> = {
    default: "linear-gradient(to bottom, #e8a862, #dda15e, #d4a574)",
    menthol: "linear-gradient(to bottom, #7ecba1, #5eb88a, #4da67a)",
    slim: "linear-gradient(to bottom, #e8a862, #dda15e, #d4a574)",
  };

  const widthClass = skin === "slim" ? "w-10" : "w-full";

  return (
    <div
      className={`filter-texture h-20 ${widthClass} self-center rounded-b-sm`}
      style={{ background: skinColors[skin] }}
      onMouseDown={handleMouseDown}
      onDoubleClick={onDoubleClick}
      title="드래그: 위치 이동 | 더블클릭: 재떨기"
    />
  );
}
