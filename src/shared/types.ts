export interface TypingSession {
  id: string;
  startedAt: number;
  endedAt: number;
  durationMs: number;
  characters: number;
  wpm: number;
  cpm: number;
  domain: string;
}

export interface DailyStats {
  date: string;
  totalCharacters: number;
  sessionCount: number;
  totalWpm: number;
  totalCpm: number;
  averageWpm: number;
  averageCpm: number;
}

export interface Settings {
  enabled: boolean;
  excludedSites: string[];
}

export interface AppStorage {
  sessions: TypingSession[];
  dailyStats: Record<string, DailyStats>;
  settings: Settings;
}

export type RuntimeMessage =
  | { type: 'typing-session-completed'; payload: TypingSession }
  | { type: 'settings-updated'; payload: Settings };
