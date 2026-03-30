import { useState, useEffect } from "react";
import { loadSettings, saveSettings, AppSettings, defaultSettings } from "../stores/settingsStore";
import { getCurrentWindow } from "@tauri-apps/api/window";

export function Settings() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  useEffect(() => {
    loadSettings().then(setSettings);
  }, []);

  const update = async (updates: Partial<AppSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  return (
    <div className="bg-[#1e1e1e] text-gray-200 w-full h-full overflow-y-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold">⚙️ 설정</h1>
        <button
          onClick={() => getCurrentWindow().close()}
          className="text-gray-500 hover:text-gray-300"
        >
          ✕
        </button>
      </div>

      {/* Timer Settings */}
      <section className="mb-6">
        <h2 className="text-sm font-semibold text-orange-400 mb-3">타이머 설정</h2>

        <div className="space-y-3">
          <label className="block">
            <span className="text-xs text-gray-400">작업 시간: {settings.workMinutes}분</span>
            <input
              type="range"
              min={5}
              max={120}
              value={settings.workMinutes}
              onChange={e => update({ workMinutes: Number(e.target.value) })}
              className="w-full mt-1 accent-orange-400"
            />
          </label>

          <label className="block">
            <span className="text-xs text-gray-400">휴식 시간: {settings.breakMinutes}분</span>
            <input
              type="range"
              min={1}
              max={30}
              value={settings.breakMinutes}
              onChange={e => update({ breakMinutes: Number(e.target.value) })}
              className="w-full mt-1 accent-orange-400"
            />
          </label>

          <label className="block">
            <span className="text-xs text-gray-400">긴 휴식: {settings.longBreakMinutes}분</span>
            <input
              type="range"
              min={5}
              max={60}
              value={settings.longBreakMinutes}
              onChange={e => update({ longBreakMinutes: Number(e.target.value) })}
              className="w-full mt-1 accent-orange-400"
            />
          </label>

          <div>
            <span className="text-xs text-gray-400">모드</span>
            <div className="flex gap-2 mt-1">
              {(["pomodoro", "free", "infinite"] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => update({ timerMode: mode })}
                  className={`text-xs px-3 py-1 rounded ${
                    settings.timerMode === mode
                      ? "bg-orange-500 text-white"
                      : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  }`}
                >
                  {mode === "pomodoro" ? "뽀모도로" : mode === "free" ? "프리" : "무한"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Appearance */}
      <section className="mb-6">
        <h2 className="text-sm font-semibold text-orange-400 mb-3">외관 설정</h2>

        <div className="space-y-3">
          <div>
            <span className="text-xs text-gray-400">담배 스킨</span>
            <div className="flex gap-2 mt-1">
              {(["default", "menthol", "slim"] as const).map(skin => (
                <button
                  key={skin}
                  onClick={() => update({ cigaretteSkin: skin })}
                  className={`text-xs px-3 py-1 rounded ${
                    settings.cigaretteSkin === skin
                      ? "bg-orange-500 text-white"
                      : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  }`}
                >
                  {skin === "default" ? "기본" : skin === "menthol" ? "멘솔" : "슬림"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs text-gray-400">연기 양</span>
            <div className="flex gap-2 mt-1">
              {(["none", "low", "normal", "high"] as const).map(amt => (
                <button
                  key={amt}
                  onClick={() => update({ smokeAmount: amt })}
                  className={`text-xs px-3 py-1 rounded ${
                    settings.smokeAmount === amt
                      ? "bg-orange-500 text-white"
                      : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  }`}
                >
                  {amt === "none" ? "없음" : amt === "low" ? "적음" : amt === "normal" ? "보통" : "많음"}
                </button>
              ))}
            </div>
          </div>

          <label className="block">
            <span className="text-xs text-gray-400">위젯 투명도: {Math.round(settings.widgetOpacity * 100)}%</span>
            <input
              type="range"
              min={30}
              max={100}
              value={settings.widgetOpacity * 100}
              onChange={e => update({ widgetOpacity: Number(e.target.value) / 100 })}
              className="w-full mt-1 accent-orange-400"
            />
          </label>

          <label className="block">
            <span className="text-xs text-gray-400">불씨 glow 강도: {Math.round(settings.emberGlow * 100)}%</span>
            <input
              type="range"
              min={0}
              max={200}
              value={settings.emberGlow * 100}
              onChange={e => update({ emberGlow: Number(e.target.value) / 100 })}
              className="w-full mt-1 accent-orange-400"
            />
          </label>
        </div>
      </section>

      {/* Notification */}
      <section className="mb-6">
        <h2 className="text-sm font-semibold text-orange-400 mb-3">알림 설정</h2>

        <div className="space-y-2">
          {([
            { key: "notifySession" as const, label: "세션 완료 알림" },
            { key: "notifySound" as const, label: "알림 소리" },
            { key: "ashSound" as const, label: "재떨기 소리" },
          ]).map(({ key, label }) => (
            <label key={key} className="flex items-center justify-between">
              <span className="text-xs text-gray-400">{label}</span>
              <button
                onClick={() => update({ [key]: !settings[key] })}
                className={`w-10 h-5 rounded-full transition-colors ${
                  settings[key] ? "bg-orange-500" : "bg-gray-700"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform mx-0.5 ${
                    settings[key] ? "translate-x-5" : ""
                  }`}
                />
              </button>
            </label>
          ))}
        </div>
      </section>

      {/* System */}
      <section className="mb-6">
        <h2 className="text-sm font-semibold text-orange-400 mb-3">시스템</h2>

        <div className="space-y-2">
          {([
            { key: "autoStart" as const, label: "시작 시 자동 실행" },
            { key: "alwaysOnTop" as const, label: "항상 위에 표시" },
          ]).map(({ key, label }) => (
            <label key={key} className="flex items-center justify-between">
              <span className="text-xs text-gray-400">{label}</span>
              <button
                onClick={() => update({ [key]: !settings[key] })}
                className={`w-10 h-5 rounded-full transition-colors ${
                  settings[key] ? "bg-orange-500" : "bg-gray-700"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform mx-0.5 ${
                    settings[key] ? "translate-x-5" : ""
                  }`}
                />
              </button>
            </label>
          ))}
        </div>
      </section>
    </div>
  );
}
