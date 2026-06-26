import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { clearAllData, getSettings, saveSettings } from '../shared/storage';
import type { Settings } from '../shared/types';
import './style.css';

function Options() {
  const [settings, setSettings] = useState<Settings>({ enabled: true, excludedSites: [] });
  const [excludedText, setExcludedText] = useState('');

  useEffect(() => {
    void getSettings().then((value) => {
      setSettings(value);
      setExcludedText(value.excludedSites.join('\n'));
    });
  }, []);

  async function persist(next: Settings) {
    await saveSettings(next);
    setSettings(next);
    // 設定更新時通知所有分頁，讓 content script 不必等待下次載入。
    const tabs = await chrome.tabs.query({});
    tabs.forEach((tab) => tab.id && chrome.tabs.sendMessage(tab.id, { type: 'settings-updated', payload: next }).catch(() => undefined));
  }

  async function saveExcludedSites() {
    const excludedSites = excludedText.split('\n').map((site) => site.trim()).filter(Boolean);
    await persist({ ...settings, excludedSites });
  }

  async function clearData() {
    if (!confirm('確定要清除所有 session 與每日統計資料嗎？')) return;
    await clearAllData();
    alert('已清除所有統計資料。');
  }

  return <main>
    <h1>平均打字速度記錄器設定</h1>
    <label className="switch"><input type="checkbox" checked={settings.enabled} onChange={(event) => void persist({ ...settings, enabled: event.target.checked })} /> 啟用記錄</label>
    <label>排除網站清單（每行一個網域關鍵字）<textarea value={excludedText} onChange={(event) => setExcludedText(event.target.value)} placeholder="例如：bank.com" /></label>
    <button onClick={saveExcludedSites}>儲存排除清單</button>
    <button className="danger" onClick={clearData}>清除所有資料</button>
    <p className="note">本擴充功能只保存字元數、時間、WPM 與 CPM，不保存實際輸入內容。</p>
  </main>;
}

createRoot(document.getElementById('root')!).render(<Options />);
