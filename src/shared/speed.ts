export const MIN_SESSION_DURATION_MS = 3_000;
export const MIN_SESSION_CHARACTERS = 5;
export const IDLE_TIMEOUT_MS = 5_000;

export function calculateSpeed(characters: number, durationMs: number) {
  const minutes = durationMs / 60_000;
  if (characters <= 0 || minutes <= 0) return { wpm: 0, cpm: 0 };

  // WPM 採用標準估算：5 個字元視為 1 個 word。
  const wordsEstimated = characters / 5;
  return {
    wpm: Math.round((wordsEstimated / minutes) * 10) / 10,
    cpm: Math.round((characters / minutes) * 10) / 10,
  };
}

export function isRecordableSession(characters: number, durationMs: number) {
  return durationMs >= MIN_SESSION_DURATION_MS && characters >= MIN_SESSION_CHARACTERS;
}
