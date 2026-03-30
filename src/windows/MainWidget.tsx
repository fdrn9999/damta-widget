import { useState, useEffect, useCallback } from "react";
import { Cigarette } from "../components/Cigarette/Cigarette";
import { AshEffect, useAshEffect } from "../components/AshEffect";
import { TimerDisplay } from "../components/TimerDisplay";
import { MemoPanel } from "../components/MemoPanel";
import { Settings } from "./Settings";
import { Stats } from "./Stats";
import { About } from "./About";
import { useTimer } from "../hooks/useTimer";
import { useCigarette } from "../hooks/useCigarette";
import { useSmokeParticles } from "../hooks/useSmokeParticles";
import { useSettings } from "../hooks/useLocalStorage";
import { saveDailyStats, loadDailyStats } from "../stores/settingsStore";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import {
  sendNotification,
  isPermissionGranted,
  requestPermission,
} from "@tauri-apps/plugin-notification";

type OverlayPanel = null | "settings" | "stats" | "about";

export function MainWidget() {
  const { settings, updateSettings } = useSettings();
  const [memoOpen, setMemoOpen] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [overlay, setOverlay] = useState<OverlayPanel>(null);
  const { particles: ashParticles, triggerFlick } = useAshEffect();

  const timer = useTimer({
    workMinutes: settings.workMinutes,
    breakMinutes: settings.breakMinutes,
    longBreakMinutes: settings.longBreakMinutes,
    mode: settings.timerMode,
    onSessionComplete: async () => {
      if (settings.notifySession) {
        let granted = await isPermissionGranted();
        if (!granted) {
          const perm = await requestPermission();
          granted = perm === "granted";
        }
        if (granted) {
          sendNotification({ title: "쓰담 위젯", body: "담배 한 대 다 폈어요! 🚬 휴식하세요." });
        }
      }
      try {
        const today = new Date().toISOString().split("T")[0];
        const stats = await loadDailyStats(today);
        stats.sessionsCompleted += 1;
        stats.totalFocusMinutes += settings.workMinutes;
        stats.maxStreak = Math.max(stats.maxStreak, stats.sessionsCompleted);
        await saveDailyStats(stats);
      } catch { /* ignore */ }
    },
  });

  const isActive = timer.state === "running";
  const cigarette = useCigarette(timer.progress, isActive);
  const showSmoke = (isActive && cigarette.isLit) || isHolding;
  const smokeParticles = useSmokeParticles(showSmoke, isHolding ? "high" : settings.smokeAmount);

  // Resize window
  useEffect(() => {
    let width = 100;
    if (memoOpen) width = 340;
    if (overlay) width = 420;
    const height = overlay ? 520 : 500;
    invoke("set_main_window_size", { width: width as number, height }).catch(() => {});
  }, [memoOpen, overlay]);

  const handleCigaretteClick = useCallback(() => {
    if (timer.state === "idle") { cigarette.lightUp(); timer.start(); }
    else timer.toggle();
  }, [timer, cigarette]);

  const handleFlickAsh = useCallback(() => {
    const hadAsh = cigarette.flickAsh();
    if (hadAsh) triggerFlick(cigarette.ashHeight);
  }, [cigarette, triggerFlick]);

  const handleNewCigarette = useCallback(() => {
    timer.reset(); cigarette.resetCigarette();
  }, [timer, cigarette]);

  const openOverlay = useCallback((panel: OverlayPanel) => {
    setOverlay(prev => prev === panel ? null : panel);
    if (panel) setMemoOpen(false);
  }, []);

  // Tray events
  useEffect(() => {
    const unlisten = listen<string>("tray-event", (event) => {
      switch (event.payload) {
        case "timer-toggle": handleCigaretteClick(); break;
        case "new-cigarette": handleNewCigarette(); break;
        case "memo-toggle": setMemoOpen(p => !p); break;
        case "flick-ash": handleFlickAsh(); break;
        case "open-settings": openOverlay("settings"); break;
        case "open-stats": openOverlay("stats"); break;
        case "open-about": openOverlay("about"); break;
      }
    });
    return () => { unlisten.then(fn => fn()).catch(() => {}); };
  }, [handleCigaretteClick, handleNewCigarette, handleFlickAsh, openOverlay]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!e.ctrlKey || !e.shiftKey) return;
      switch (e.key.toUpperCase()) {
        case "A": e.preventDefault(); handleFlickAsh(); break;
        case "M": e.preventDefault(); setMemoOpen(p => !p); break;
        case "S": e.preventDefault(); handleCigaretteClick(); break;
        case "N": e.preventDefault(); handleNewCigarette(); break;
        case "D": e.preventDefault();
          getCurrentWindow().isVisible().then(v => v ? getCurrentWindow().hide() : getCurrentWindow().show());
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleFlickAsh, handleCigaretteClick, handleNewCigarette]);

  return (
    <div className="flex h-screen select-none rounded-xl overflow-hidden"
      style={{ opacity: settings.widgetOpacity, background: "rgba(17,17,17,0.92)" }}>

      {/* Cigarette Area — 항상 왼쪽 */}
      <div className="flex flex-col items-center justify-end w-[100px] h-full relative flex-shrink-0">
        <div className="absolute top-0 left-0 right-0 h-8 cursor-grab z-20 flex items-center justify-center"
          onMouseDown={() => getCurrentWindow().startDragging().catch(() => {})}>
          <div className="w-6 h-1 rounded-full bg-gray-600 opacity-40" />
        </div>

        <button onClick={() => setMemoOpen(!memoOpen)}
          className="absolute top-8 right-2 text-lg opacity-50 hover:opacity-100 transition-opacity z-10"
          title="메모">💭</button>

        <button onClick={() => openOverlay("settings")}
          className="absolute top-8 left-1 text-sm opacity-30 hover:opacity-80 transition-opacity z-10"
          title="설정">⚙️</button>

        <div className="relative">
          <AshEffect particles={ashParticles} />
          <Cigarette ashHeight={cigarette.ashHeight} paperHeight={cigarette.paperHeight}
            isLit={cigarette.isLit} isActive={isActive} showSmoke={showSmoke}
            skin={settings.cigaretteSkin} smokeParticles={smokeParticles} emberGlow={settings.emberGlow}
            onBodyClick={handleCigaretteClick} onFlickAsh={handleFlickAsh}
            onHoldStart={() => { setIsHolding(true); timer.setBurnRate(3); }}
            onHoldEnd={() => { setIsHolding(false); timer.setBurnRate(1); }} />
        </div>

        <TimerDisplay display={timer.display} state={timer.state} isBurning={isHolding} />
        <div className="text-[8px] text-gray-600 mb-2">🚬 {timer.sessionCount}</div>
      </div>

      {/* 오른쪽 패널: 설정/통계/정보/메모 */}
      {overlay && (
        <div className="flex-1 min-w-[320px] h-full overflow-hidden">
          {overlay === "settings" && <Settings onClose={() => setOverlay(null)} settings={settings} onUpdate={updateSettings} />}
          {overlay === "stats" && <Stats onClose={() => setOverlay(null)} />}
          {overlay === "about" && <About onClose={() => setOverlay(null)} />}
        </div>
      )}

      {!overlay && memoOpen && (
        <div className="flex-shrink-0">
          <MemoPanel isOpen={memoOpen} onClose={() => setMemoOpen(false)} />
        </div>
      )}
    </div>
  );
}
