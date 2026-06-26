import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { getDateKey, getSettings, getStorage, saveSettings } from '../shared/storage';
import type { DailyStats, Settings, TypingSession } from '../shared/types';
import './style.css';

function Popup() {
  const [today, setToday] = useState<DailyStats>();
  const [lastSession, setLastSession] = useState<TypingSession>();
  const [settings, setSettings] = useState<Settings>({ enabled: true, excludedSites: [] });

  async function refresh() {
    const storage = await getStorage();
    setToday(storage.dailyStats[getDateKey()] ?? undefined);
    setLastSession(storage.sessions.at(-1));
    setSettings(await getSettings());
  }

  useEffect(() => { void refresh(); }, []);

  const cards = useMemo(() => [
    ['今日平均 WPM', today?.averageWpm ?? 0],
    ['今日平均 CPM', today?.averageCpm ?? 0],
    ['今日輸入字元數', today?.totalCharacters ?? 0],
    ['今日 session 數', today?.sessionCount ?? 0],
  ], [today]);

  async function toggleEnabled() {
    const next = { ...settings, enabled: !settings.enabled };
    await saveSettings(next);
    await chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
      if (tab.id) chrome.tabs.sendMessage(tab.id, { type: 'settings-updated', payload: next }).catch(() => undefined);
    });
    setSettings(next);
  }

  return <main>
    <h1>平均打字速度</h1>
    <button onClick={toggleEnabled}>{settings.enabled ? '暫停記錄' : '啟用記錄'}</button>
    <section className="grid">{cards.map(([label, value]) => <article key={label}><span>{label}</span><strong>{value}</strong></article>)}</section>
    <section className="last"><h2>最近一次 session</h2><p>WPM：{lastSession?.wpm ?? 0} / CPM：{lastSession?.cpm ?? 0}</p></section>
  </main>;
}

createRoot(document.getElementById('root')!).render(<Popup />);
