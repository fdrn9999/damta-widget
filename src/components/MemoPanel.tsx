import { useState, useEffect, useRef, useCallback } from "react";
import { MemoData, loadMemos, saveMemos } from "../stores/settingsStore";

interface MemoPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MemoPanel({ isOpen, onClose }: MemoPanelProps) {
  const [memos, setMemos] = useState<MemoData[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [saveStatus, setSaveStatus] = useState("");
  const saveTimerRef = useRef<number | null>(null);

  useEffect(() => {
    loadMemos().then(setMemos);
  }, []);

  const autoSave = useCallback(async (updatedMemos: MemoData[]) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(async () => {
      await saveMemos(updatedMemos);
      setSaveStatus("자동 저장됨 ✓");
      setTimeout(() => setSaveStatus(""), 2000);
    }, 1000);
  }, []);

  const updateMemo = (field: "title" | "content", value: string) => {
    const updated = memos.map((m, i) =>
      i === activeTab ? { ...m, [field]: value, updatedAt: new Date().toISOString() } : m
    );
    setMemos(updated);
    autoSave(updated);
  };

  const addMemo = () => {
    if (memos.length >= 5) return;
    const newMemo: MemoData = {
      id: Date.now(),
      title: "메모",
      content: "",
      updatedAt: new Date().toISOString(),
    };
    const updated = [...memos, newMemo];
    setMemos(updated);
    setActiveTab(updated.length - 1);
    saveMemos(updated);
  };

  const deleteMemo = (idx: number) => {
    if (memos.length <= 1) return;
    const updated = memos.filter((_, i) => i !== idx);
    setMemos(updated);
    setActiveTab(Math.min(activeTab, updated.length - 1));
    saveMemos(updated);
  };

  if (!isOpen) return null;

  const current = memos[activeTab];
  if (!current) return null;

  return (
    <div className="memo-slide-in w-60 h-[300px] bg-[#1a1a1a]/90 backdrop-blur-md rounded-xl flex flex-col overflow-hidden border border-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-800">
        <input
          className="bg-transparent text-gray-200 text-sm font-medium w-32 outline-none"
          value={current.title}
          onChange={e => updateMemo("title", e.target.value)}
        />
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-300 text-sm"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <textarea
        className="flex-1 bg-transparent text-gray-200 text-xs p-3 resize-none outline-none placeholder-gray-600"
        placeholder="여기에 적어두세요..."
        value={current.content}
        onChange={e => updateMemo("content", e.target.value)}
      />

      {/* Footer */}
      <div className="px-3 py-1.5 border-t border-gray-800 flex items-center justify-between">
        <span className="text-[9px] text-gray-600">
          {current.content.length}자 {saveStatus && `· ${saveStatus}`}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-2 py-1 border-t border-gray-800">
        {memos.map((m, i) => (
          <button
            key={m.id}
            onClick={() => setActiveTab(i)}
            onDoubleClick={() => deleteMemo(i)}
            className={`text-[9px] px-2 py-0.5 rounded ${
              i === activeTab
                ? "bg-gray-700 text-gray-200"
                : "text-gray-500 hover:text-gray-400"
            }`}
            title={i === activeTab ? "" : "더블클릭: 삭제"}
          >
            {i + 1}
          </button>
        ))}
        {memos.length < 5 && (
          <button
            onClick={addMemo}
            className="text-[9px] text-gray-600 hover:text-gray-400 px-1"
          >
            +
          </button>
        )}
      </div>
    </div>
  );
}
