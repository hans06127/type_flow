import { saveSession } from '../shared/storage';
import type { RuntimeMessage } from '../shared/types';

chrome.runtime.onInstalled.addListener(() => {
  // 預留初始化鉤子，未來可在版本升級時進行資料遷移。
});

chrome.runtime.onMessage.addListener((message: RuntimeMessage) => {
  if (message.type === 'typing-session-completed') {
    void saveSession(message.payload);
  }
});
