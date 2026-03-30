import { useState, useEffect } from "react";
import { loadDailyStats, loadWeeklyStats, DailyStats } from "../stores/settingsStore";
import { getCurrentWindow } from "@tauri-apps/api/window";

export function Stats() {
  const [today, setToday] = useState<DailyStats | null>(null);
  const [weekly, setWeekly] = useState<DailyStats[]>([]);

  useEffect(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    loadDailyStats(todayStr).then(setToday);
    loadWeeklyStats().then(setWeekly);
  }, []);

  const maxSessions = Math.max(1, ...weekly.map(d => d.sessionsCompleted));

  return (
    <div className="bg-[#1e1e1e] text-gray-200 w-full h-full p-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold">📊 오늘의 통계</h1>
        <button
          onClick={() => getCurrentWindow().close()}
          className="text-gray-500 hover:text-gray-300"
        >
          ✕
        </button>
      </div>

      {today && (
        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3 bg-gray-900 rounded-lg p-3">
            <span className="text-2xl">🚬</span>
            <div>
              <div className="text-xs text-gray-500">오늘 피운 담배</div>
              <div className="text-xl font-bold">{today.sessionsCompleted}개비</div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-gray-900 rounded-lg p-3">
            <span className="text-2xl">⏱</span>
            <div>
              <div className="text-xs text-gray-500">총 집중 시간</div>
              <div className="text-xl font-bold">
                {Math.floor(today.totalFocusMinutes / 60)}시간 {today.totalFocusMinutes % 60}분
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-gray-900 rounded-lg p-3">
            <span className="text-2xl">🔥</span>
            <div>
              <div className="text-xs text-gray-500">연속 세션</div>
              <div className="text-xl font-bold">{today.maxStreak}회</div>
            </div>
          </div>
        </div>
      )}

      {/* Weekly chart */}
      <div>
        <h2 className="text-sm font-semibold text-orange-400 mb-3">📅 주간 기록</h2>
        <div className="flex items-end gap-2 h-32 bg-gray-900 rounded-lg p-3">
          {weekly.map(day => (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full bg-orange-500/80 rounded-t min-h-[2px] transition-all"
                style={{
                  height: `${(day.sessionsCompleted / maxSessions) * 80}px`,
                }}
              />
              <span className="text-[8px] text-gray-500">
                {new Date(day.date + "T12:00:00").toLocaleDateString("ko-KR", { weekday: "short" })}
              </span>
              <span className="text-[8px] text-gray-600">{day.sessionsCompleted}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
