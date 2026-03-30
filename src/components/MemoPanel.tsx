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
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMemos().then(setMemos);
  }, []);

  // Sync editor content when tab changes
  useEffect(() => {
    if (editorRef.current && memos[activeTab]) {
      editorRef.current.innerHTML = memos[activeTab].content;
    }
  }, [activeTab, memos.length]); // eslint-disable-line

  const autoSave = useCallback((updatedMemos: MemoData[]) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    setSaveStatus("...");
    saveTimerRef.current = window.setTimeout(async () => {
      await saveMemos(updatedMemos);
      setSaveStatus("저장됨 ✓");
      setTimeout(() => setSaveStatus(""), 2000);
    }, 800);
  }, []);

  const handleEditorInput = () => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    const updated = memos.map((m, i) =>
      i === activeTab ? { ...m, content: html, updatedAt: new Date().toISOString() } : m
    );
    setMemos(updated);
    autoSave(updated);
  };

  const updateTitle = (value: string) => {
    const updated = memos.map((m, i) =>
      i === activeTab ? { ...m, title: value, updatedAt: new Date().toISOString() } : m
    );
    setMemos(updated);
    autoSave(updated);
  };

  const execCmd = (cmd: string, value?: string) => {
    document.execCommand(cmd, false, value);
    editorRef.current?.focus();
    handleEditorInput();
  };

  const addMemo = () => {
    if (memos.length >= 5) return;
    const newMemo: MemoData = {
      id: Date.now(),
      title: `메모 ${memos.length + 1}`,
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

  const textLen = editorRef.current?.textContent?.length ?? 0;

  return (
    <div
      className="memo-slide-in w-60 h-full flex flex-col overflow-hidden"
      style={{ background: "#1a1a1a", borderRight: "1px solid #2a2a2a" }}
    >
      {/* Header */}
      <div className="px-3 py-2 flex items-center justify-between" style={{ borderBottom: "1px solid #2a2a2a" }}>
        <input
          className="bg-transparent text-gray-200 text-[13px] font-semibold w-36 outline-none placeholder-gray-600"
          value={current.title}
          onChange={e => updateTitle(e.target.value)}
          placeholder="제목"
        />
        <button onClick={onClose} className="text-gray-600 hover:text-gray-300 text-sm transition-colors">✕</button>
      </div>

      {/* Formatting toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1" style={{ borderBottom: "1px solid #222" }}>
        <FmtBtn label="B" title="볼드 (Ctrl+B)" style={{ fontWeight: 700 }} onClick={() => execCmd("bold")} />
        <FmtBtn label="I" title="이탤릭 (Ctrl+I)" style={{ fontStyle: "italic" }} onClick={() => execCmd("italic")} />
        <FmtBtn label="U" title="밑줄 (Ctrl+U)" style={{ textDecoration: "underline" }} onClick={() => execCmd("underline")} />
        <FmtBtn label="S" title="취소선" style={{ textDecoration: "line-through" }} onClick={() => execCmd("strikeThrough")} />
        <div className="w-px h-3 bg-gray-700 mx-1" />
        <FmtBtn label="•" title="목록" onClick={() => execCmd("insertUnorderedList")} />
        <FmtBtn label="1." title="번호 목록" style={{ fontSize: 9 }} onClick={() => execCmd("insertOrderedList")} />
        <div className="w-px h-3 bg-gray-700 mx-1" />
        <FmtBtn label="A-" title="글자 줄이기" style={{ fontSize: 8 }} onClick={() => execCmd("fontSize", "2")} />
        <FmtBtn label="A+" title="글자 키우기" style={{ fontSize: 11 }} onClick={() => execCmd("fontSize", "4")} />
      </div>

      {/* Rich text editor */}
      <div
        ref={editorRef}
        contentEditable
        className="flex-1 overflow-y-auto px-3 py-2 outline-none text-gray-200 text-[12px] leading-[1.7]"
        style={{
          fontFamily: "'Malgun Gothic', 'Apple SD Gothic Neo', -apple-system, sans-serif",
          minHeight: 0,
          wordBreak: "break-word",
        }}
        onInput={handleEditorInput}
        suppressContentEditableWarning
        data-placeholder="메모를 입력하세요..."
      />

      {/* Status bar */}
      <div className="px-3 py-1 flex items-center justify-between" style={{ borderTop: "1px solid #2a2a2a" }}>
        <span className="text-[9px] text-gray-600 font-mono">
          {textLen}자
          {saveStatus && <span className="text-amber-700 ml-1">{saveStatus}</span>}
        </span>
        <span className="text-[8px] text-gray-700">Ctrl+B/I/U</span>
      </div>

      {/* Tabs */}
      <div className="flex items-center px-1 py-1" style={{ borderTop: "1px solid #2a2a2a" }}>
        {memos.map((m, i) => (
          <button
            key={m.id}
            onClick={() => setActiveTab(i)}
            onDoubleClick={() => deleteMemo(i)}
            className={`flex-1 py-1 mx-0.5 rounded text-[10px] transition-all truncate ${
              i === activeTab
                ? "bg-amber-800/30 text-amber-400 font-medium"
                : "text-gray-600 hover:text-gray-400 hover:bg-gray-800/40"
            }`}
            title={i === activeTab ? m.title : "더블클릭: 삭제"}
          >
            {i + 1}
          </button>
        ))}
        {memos.length < 5 && (
          <button
            onClick={addMemo}
            className="px-2 py-1 mx-0.5 rounded text-[10px] text-gray-600 hover:text-amber-400 hover:bg-amber-900/20 transition-all"
          >
            +
          </button>
        )}
      </div>
    </div>
  );
}

function FmtBtn({ label, title, style, onClick }: {
  label: string;
  title: string;
  style?: React.CSSProperties;
  onClick: () => void;
}) {
  return (
    <button
      onMouseDown={e => { e.preventDefault(); onClick(); }}
      title={title}
      className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 transition-all text-[11px]"
      style={style}
    >
      {label}
    </button>
  );
}
