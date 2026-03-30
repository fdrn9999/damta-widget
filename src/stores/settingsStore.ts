import { Store } from "@tauri-apps/plugin-store";

export interface AppSettings {
  workMinutes: number;
  breakMinutes: number;
  longBreakMinutes: number;
  timerMode: "pomodoro" | "free" | "infinite";
  cigaretteSkin: "default" | "menthol" | "slim";
  smokeAmount: "none" | "low" | "normal" | "high";
  widgetOpacity: number;
  emberGlow: number;
  notifySession: boolean;
  notifySound: boolean;
  ashSound: boolean;
  autoStart: boolean;
  alwaysOnTop: boolean;
}

export const defaultSettings: AppSettings = {
  workMinutes: 25,
  breakMinutes: 5,
  longBreakMinutes: 15,
  timerMode: "pomodoro",
  cigaretteSkin: "default",
  smokeAmount: "normal",
  widgetOpacity: 1.0,
  emberGlow: 1.0,
  notifySession: true,
  notifySound: true,
  ashSound: true,
  autoStart: false,
  alwaysOnTop: true,
};

export interface MemoData {
  id: number;
  title: string;
  content: string;
  updatedAt: string;
}

export interface DailyStats {
  date: string;
  sessionsCompleted: number;
  totalFocusMinutes: number;
  maxStreak: number;
}

let store: Store | null = null;

async function getStore(): Promise<Store> {
  if (!store) {
    store = await Store.load("ssudam-settings.json");
  }
  return store;
}

export async function loadSettings(): Promise<AppSettings> {
  const s = await getStore();
  const saved = await s.get<AppSettings>("settings");
  return saved ? { ...defaultSettings, ...saved } : defaultSettings;
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  const s = await getStore();
  await s.set("settings", settings);
  await s.save();
}

export async function loadMemos(): Promise<MemoData[]> {
  const s = await getStore();
  const memos = await s.get<MemoData[]>("memos");
  return memos || [{ id: 1, title: "메모", content: "", updatedAt: new Date().toISOString() }];
}

export async function saveMemos(memos: MemoData[]): Promise<void> {
  const s = await getStore();
  await s.set("memos", memos);
  await s.save();
}

export async function loadDailyStats(date: string): Promise<DailyStats> {
  const s = await getStore();
  const allStats = await s.get<Record<string, DailyStats>>("dailyStats") || {};
  return allStats[date] || { date, sessionsCompleted: 0, totalFocusMinutes: 0, maxStreak: 0 };
}

export async function saveDailyStats(stats: DailyStats): Promise<void> {
  const s = await getStore();
  const allStats = await s.get<Record<string, DailyStats>>("dailyStats") || {};
  allStats[stats.date] = stats;
  await s.set("dailyStats", allStats);
  await s.save();
}

export async function loadWeeklyStats(): Promise<DailyStats[]> {
  const s = await getStore();
  const allStats = await s.get<Record<string, DailyStats>>("dailyStats") || {};
  const result: DailyStats[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    result.push(allStats[key] || { date: key, sessionsCompleted: 0, totalFocusMinutes: 0, maxStreak: 0 });
  }
  return result;
}

export async function saveWindowPosition(x: number, y: number): Promise<void> {
  const s = await getStore();
  await s.set("windowPosition", { x, y });
  await s.save();
}

export async function loadWindowPosition(): Promise<{ x: number; y: number } | null> {
  const s = await getStore();
  const pos = await s.get<{ x: number; y: number }>("windowPosition");
  return pos ?? null;
}
