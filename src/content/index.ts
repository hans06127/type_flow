import { getSettings } from '../shared/storage';
import { calculateSpeed, IDLE_TIMEOUT_MS, isRecordableSession } from '../shared/speed';
import type { RuntimeMessage, Settings } from '../shared/types';

let settings: Settings = { enabled: true, excludedSites: [] };
let sessionStart = 0;
let characters = 0;
let idleTimer: number | undefined;

void getSettings().then((value) => (settings = value));

chrome.runtime.onMessage.addListener((message: RuntimeMessage) => {
  if (message.type === 'settings-updated') settings = message.payload;
});

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  return tag === 'textarea' || tag === 'input' || target.isContentEditable;
}

function isCurrentSiteExcluded() {
  const host = location.hostname.toLowerCase();
  return settings.excludedSites.some((site) => host.includes(site.toLowerCase()));
}

function finishSession() {
  if (!sessionStart) return;
  const endedAt = Date.now();
  const durationMs = endedAt - sessionStart;

  if (isRecordableSession(characters, durationMs)) {
    const speed = calculateSpeed(characters, durationMs);
    // 僅傳送統計資料；不讀取或保存任何實際輸入文字內容。
    chrome.runtime.sendMessage({
      type: 'typing-session-completed',
      payload: {
        id: crypto.randomUUID(),
        startedAt: sessionStart,
        endedAt,
        durationMs,
        characters,
        domain: location.hostname,
        ...speed,
      },
    } satisfies RuntimeMessage);
  }

  sessionStart = 0;
  characters = 0;
  idleTimer = undefined;
}

function onInput(event: InputEvent) {
  if (!settings.enabled || isCurrentSiteExcluded() || !isEditableTarget(event.target)) return;
  if (!sessionStart) sessionStart = Date.now();

  // inputType 可辨識刪除、貼上、輸入等行為；只把新增的字元納入速度估算。
  if (event.inputType?.startsWith('delete')) return;
  characters += Math.max(event.data?.length ?? 1, 1);

  if (idleTimer) window.clearTimeout(idleTimer);
  idleTimer = window.setTimeout(finishSession, IDLE_TIMEOUT_MS);
}

document.addEventListener('input', onInput as EventListener, true);
