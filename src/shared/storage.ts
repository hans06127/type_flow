import type { AppStorage, DailyStats, Settings, TypingSession } from './types';

const DEFAULT_SETTINGS: Settings = { enabled: true, excludedSites: [] };
const DEFAULT_STORAGE: AppStorage = { sessions: [], dailyStats: {}, settings: DEFAULT_SETTINGS };

export async function getStorage(): Promise<AppStorage> {
  const data = await chrome.storage.local.get(DEFAULT_STORAGE);
  return data as AppStorage;
}

export async function getSettings(): Promise<Settings> {
  const { settings } = await getStorage();
  return { ...DEFAULT_SETTINGS, ...settings };
}

export async function saveSettings(settings: Settings) {
  await chrome.storage.local.set({ settings });
}

export function getDateKey(time = Date.now()) {
  return new Date(time).toISOString().slice(0, 10);
}

export async function saveSession(session: TypingSession) {
  const storage = await getStorage();
  const sessions = [...storage.sessions, session];
  const date = getDateKey(session.endedAt);
  const current: DailyStats = storage.dailyStats[date] ?? {
    date,
    totalCharacters: 0,
    sessionCount: 0,
    totalWpm: 0,
    totalCpm: 0,
    averageWpm: 0,
    averageCpm: 0,
  };

  const next: DailyStats = {
    ...current,
    totalCharacters: current.totalCharacters + session.characters,
    sessionCount: current.sessionCount + 1,
    totalWpm: current.totalWpm + session.wpm,
    totalCpm: current.totalCpm + session.cpm,
    averageWpm: Math.round(((current.totalWpm + session.wpm) / (current.sessionCount + 1)) * 10) / 10,
    averageCpm: Math.round(((current.totalCpm + session.cpm) / (current.sessionCount + 1)) * 10) / 10,
  };

  await chrome.storage.local.set({ sessions, dailyStats: { ...storage.dailyStats, [date]: next } });
}

export async function clearAllData() {
  await chrome.storage.local.set({ ...DEFAULT_STORAGE, settings: await getSettings() });
}
