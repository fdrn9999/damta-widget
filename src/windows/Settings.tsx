import { useState, useEffect } from "react";
import { AppSettings } from "../stores/settingsStore";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { enable, disable, isEnabled } from "@tauri-apps/plugin-autostart";

interface SettingsProps {
  onClose?: () => void;
  settings?: AppSettings;
  onUpdate?: (updates: Partial<AppSettings>) => void;
}

export function Settings({ onClose, settings: propSettings, onUpdate }: SettingsProps) {
  const [draft, setDraft] = useState<AppSettings | null>(null);
  const [autoStartEnabled, setAutoStartEnabled] = useState(false);
  const [activeTab, setActiveTab] = useState<"timer" | "look" | "system">("timer");
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (propSettings) setDraft({ ...propSettings });
    isEnabled().then(setAutoStartEnabled).catch(() => {});
  }, []); // eslint-disable-line

  if (!draft || !propSettings) return null;
  const settings = draft;

  const update = (updates: Partial<AppSettings>) => {
    setDraft(prev => prev ? { ...prev, ...updates } : prev);
    setHasChanges(true);
  };

  const applySettings = () => {
    onUpdate?.(draft);
    if (draft.alwaysOnTop !== propSettings.alwaysOnTop) {
      getCurrentWindow().setAlwaysOnTop(draft.alwaysOnTop).catch(() => {});
    }
    setHasChanges(false);
  };

  const resetSettings = () => {
    setDraft({ ...propSettings });
    setHasChanges(false);
  };

  const tabs = [
    { id: "timer" as const, icon: "🔥", label: "타이머" },
    { id: "look" as const, icon: "🎨", label: "외관" },
    { id: "system" as const, icon: "⚙️", label: "시스템" },
  ];

  return (
    <div className="w-full h-full flex flex-col" style={{ background: "#141414" }}>
      {/* Header - cigarette pack style */}
      <div
        className="px-5 pt-5 pb-3 relative"
        style={{
          background: "linear-gradient(135deg, #1a1a1a 0%, #222 50%, #1a1a1a 100%)",
          borderBottom: "1px solid rgba(232,168,98,0.15)",
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-gray-100 tracking-wide">설정</h1>
            <p className="text-[10px] text-amber-700 mt-0.5 tracking-widest uppercase">SSUDAM WIDGET PREFERENCES</p>
          </div>
          <button
            onClick={() => onClose ? onClose() : getCurrentWindow().close()}
            className="w-7 h-7 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-all"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t text-xs transition-all ${
                activeTab === tab.id
                  ? "bg-[#1e1e1e] text-amber-400 border-t border-x border-amber-800/30"
                  : "text-gray-500 hover:text-gray-400"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5" style={{ background: "#1e1e1e" }}>
        {activeTab === "timer" && (
          <div className="space-y-5">
            {/* Mode selector — styled like cigarette brands */}
            <div>
              <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 block">모드</label>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { id: "pomodoro" as const, name: "뽀모도로", desc: "25/5/15분" },
                  { id: "free" as const, name: "프리", desc: "자유 설정" },
                  { id: "infinite" as const, name: "무한", desc: "분위기용" },
                ] as const).map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => update({ timerMode: mode.id })}
                    className={`p-3 rounded-lg text-left transition-all border ${
                      settings.timerMode === mode.id
                        ? "border-amber-600/50 bg-amber-900/20"
                        : "border-gray-800 bg-black/20 hover:border-gray-700"
                    }`}
                  >
                    <div className={`text-xs font-medium ${settings.timerMode === mode.id ? "text-amber-400" : "text-gray-400"}`}>
                      {mode.name}
                    </div>
                    <div className="text-[9px] text-gray-600 mt-0.5">{mode.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Time sliders — 모드에 따라 비활성화 */}
            <SliderField
              label="작업 시간"
              value={settings.workMinutes}
              min={5} max={120} unit="분"
              onChange={v => update({ workMinutes: v })}
              disabled={settings.timerMode === "infinite"}
            />
            <SliderField
              label="휴식 시간"
              value={settings.breakMinutes}
              min={1} max={30} unit="분"
              onChange={v => update({ breakMinutes: v })}
              disabled={settings.timerMode !== "pomodoro"}
            />
            <SliderField
              label="긴 휴식"
              value={settings.longBreakMinutes}
              min={5} max={60} unit="분"
              onChange={v => update({ longBreakMinutes: v })}
              disabled={settings.timerMode !== "pomodoro"}
            />
          </div>
        )}

        {activeTab === "look" && (
          <div className="space-y-5">
            {/* Cigarette skin */}
            <div>
              <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 block">담배 스킨</label>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { id: "default" as const, name: "레귤러", color: "#e8a862" },
                  { id: "menthol" as const, name: "멘솔", color: "#7ecba1" },
                  { id: "slim" as const, name: "슬림", color: "#d4a574" },
                ] as const).map(skin => (
                  <button
                    key={skin.id}
                    onClick={() => update({ cigaretteSkin: skin.id })}
                    className={`p-3 rounded-lg text-center transition-all border ${
                      settings.cigaretteSkin === skin.id
                        ? "border-amber-600/50 bg-amber-900/20"
                        : "border-gray-800 bg-black/20 hover:border-gray-700"
                    }`}
                  >
                    {/* Mini cigarette preview */}
                    <div className="flex flex-col items-center gap-1 mb-1.5">
                      <div className="w-2 h-1 rounded-full bg-gray-500" />
                      <div className="w-2 h-6 bg-white rounded-sm" />
                      <div className="w-2 h-3 rounded-b-sm" style={{ background: skin.color }} />
                    </div>
                    <div className={`text-[10px] ${settings.cigaretteSkin === skin.id ? "text-amber-400" : "text-gray-500"}`}>
                      {skin.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Smoke amount */}
            <div>
              <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 block">연기 양</label>
              <div className="flex gap-1">
                {(["none", "low", "normal", "high"] as const).map(amt => (
                  <button
                    key={amt}
                    onClick={() => update({ smokeAmount: amt })}
                    className={`flex-1 py-2 rounded text-[10px] transition-all ${
                      settings.smokeAmount === amt
                        ? "bg-amber-600 text-white"
                        : "bg-gray-800/50 text-gray-500 hover:text-gray-400"
                    }`}
                  >
                    {amt === "none" ? "없음" : amt === "low" ? "적음" : amt === "normal" ? "보통" : "많음"}
                  </button>
                ))}
              </div>
            </div>

            <TickSliderField
              label="위젯 투명도"
              value={Math.round(settings.widgetOpacity * 100)}
              min={30} max={100} step={10} unit="%"
              onChange={v => update({ widgetOpacity: v / 100 })}
            />
            <SliderField
              label="불씨 강도"
              value={Math.round(settings.emberGlow * 100)}
              min={0} max={200} unit="%"
              onChange={v => update({ emberGlow: v / 100 })}
            />
          </div>
        )}

        {activeTab === "system" && (
          <div className="space-y-4">
            <ToggleField
              label="세션 완료 알림"
              description="담배 한 대 다 피면 알림"
              value={settings.notifySession}
              onChange={v => update({ notifySession: v })}
            />
            <ToggleField
              label="알림 소리"
              value={settings.notifySound}
              onChange={v => update({ notifySound: v })}
            />
            <ToggleField
              label="재떨기 소리"
              value={settings.ashSound}
              onChange={v => update({ ashSound: v })}
            />

            <div className="border-t border-gray-800 my-4" />

            <ToggleField
              label="시작 시 자동 실행"
              description="컴퓨터 켜면 자동으로 시작"
              value={autoStartEnabled}
              onChange={async (v) => {
                try {
                  if (v) await enable(); else await disable();
                  setAutoStartEnabled(v);
                } catch { /* ignore */ }
              }}
            />
            <ToggleField
              label="항상 위에 표시"
              value={settings.alwaysOnTop}
              onChange={v => update({ alwaysOnTop: v })}
            />

            <div className="border-t border-gray-800 my-4" />

            {/* Version & Credits */}
            <div className="text-center py-4 space-y-1">
              <p className="text-[10px] text-gray-600">쓰담 위젯 v1.0.0</p>
              <p className="text-[9px] text-gray-700">Made by 정진호 (Jinho Chung)</p>
              <p className="text-[9px] text-gray-700">& 박찬진 (Chanjin Park)</p>
            </div>
          </div>
        )}
      </div>

      {/* 적용/취소 버튼 바 */}
      <div className="px-5 py-3 flex items-center justify-end gap-2" style={{ borderTop: "1px solid rgba(232,168,98,0.15)", background: "#141414" }}>
        <button
          onClick={() => { resetSettings(); onClose?.(); }}
          className="px-4 py-1.5 text-xs text-gray-400 hover:text-gray-200 rounded transition-all"
        >
          취소
        </button>
        <button
          onClick={applySettings}
          disabled={!hasChanges}
          className={`px-4 py-1.5 text-xs rounded transition-all ${
            hasChanges
              ? "bg-amber-600 text-white hover:bg-amber-500"
              : "bg-gray-800 text-gray-600 cursor-not-allowed"
          }`}
        >
          적용
        </button>
      </div>
    </div>
  );
}

/* ── Reusable sub-components ────────────────────── */

function SliderField({ label, value, min, max, unit, onChange, disabled }: {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className={disabled ? "opacity-35 pointer-events-none" : ""}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] text-gray-500 uppercase tracking-wider">{label}</span>
        <span className="text-xs text-amber-400 font-mono">{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        disabled={disabled}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, #d97706 0%, #d97706 ${((value - min) / (max - min)) * 100}%, #333 ${((value - min) / (max - min)) * 100}%, #333 100%)`,
        }}
      />
    </div>
  );
}

function TickSliderField({ label, value, min, max, step, unit, onChange }: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  const ticks: number[] = [];
  for (let i = min; i <= max; i += step) ticks.push(i);

  const handleInput = (raw: string) => {
    const n = parseInt(raw, 10);
    if (!isNaN(n)) onChange(Math.max(min, Math.min(max, n)));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-gray-500 uppercase tracking-wider">{label}</span>
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={min}
            max={max}
            value={value}
            onChange={e => handleInput(e.target.value)}
            className="w-10 text-right text-xs text-amber-400 font-mono bg-transparent border border-gray-700 rounded px-1 py-0.5 outline-none focus:border-amber-600 appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <span className="text-[10px] text-gray-600">{unit}</span>
        </div>
      </div>
      {/* Slider with ticks */}
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer relative z-10"
          style={{
            background: `linear-gradient(to right, #d97706 0%, #d97706 ${((value - min) / (max - min)) * 100}%, #333 ${((value - min) / (max - min)) * 100}%, #333 100%)`,
          }}
        />
        {/* Tick marks */}
        <div className="flex justify-between px-[2px] mt-1">
          {ticks.map(t => (
            <div key={t} className="flex flex-col items-center" style={{ width: 0 }}>
              <div className={`w-[1px] h-1.5 ${t <= value ? "bg-amber-700" : "bg-gray-700"}`} />
              <span className={`text-[7px] mt-0.5 ${t <= value ? "text-amber-800" : "text-gray-700"}`}>{t}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ToggleField({ label, description, value, onChange }: {
  label: string;
  description?: string;
  value: boolean;
  onChange: (v: boolean) => void | Promise<void>;
}) {
  return (
    <div
      className="flex items-center justify-between py-1 cursor-pointer group"
      onClick={() => { onChange(!value); }}
    >
      <div>
        <div className="text-xs text-gray-300 group-hover:text-gray-200 transition-colors">{label}</div>
        {description && <div className="text-[9px] text-gray-600 mt-0.5">{description}</div>}
      </div>
      <div className={`w-9 h-5 rounded-full transition-all relative ${value ? "bg-amber-600" : "bg-gray-700"}`}>
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${value ? "left-[18px]" : "left-0.5"}`} />
      </div>
    </div>
  );
}
