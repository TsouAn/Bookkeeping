import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from './api.js';
import { taipeiMonth } from './time.js';
import CalendarPage from './components/CalendarPage.jsx';
import ComparePage from './components/ComparePage.jsx';
import MonthPicker from './components/MonthPicker.jsx';
import MonthlySummary from './components/MonthlySummary.jsx';
import NavDrawer from './components/NavDrawer.jsx';
import Tabs from './components/Tabs.jsx';
import TransactionForm from './components/TransactionForm.jsx';
import TransactionList from './components/TransactionList.jsx';

// 頁籤／選單的種類與順序見 openspec/specs/app-navigation
const TABS = [
  ['ledger', '記帳'],
  ['calendar', '日曆'],
  ['compare', '比較'],
];

export default function App() {
  const [tab, setTab] = useState('ledger');
  // 記帳頁的狀態放在 App，切換頁籤時不會遺失（spec: 切換頁籤保留記帳頁狀態）
  const [month, setMonth] = useState(() => taipeiMonth());
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loadError, setLoadError] = useState('');
  // 剛新增的紀錄，在明細中醒目標示約 2 秒（spec: ledger-page 新紀錄醒目標示）
  const [highlightId, setHighlightId] = useState(null);
  // 電腦版 ☰ 選單（spec: app-navigation 電腦版選單）
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef(null);

  // 重新抓列表與統計（見 design.md 決策 5）
  const refresh = useCallback(async () => {
    try {
      const [list, sum] = await Promise.all([api.list(month), api.summary(month)]);
      setTransactions(list);
      setSummary(sum);
      setLoadError('');
    } catch (err) {
      setLoadError(`無法載入資料：${err.message}。請確認後端是否已啟動。`);
    }
  }, [month]);

  useEffect(() => {
    if (tab === 'ledger') refresh();
  }, [refresh, tab]);

  useEffect(() => {
    if (highlightId === null) return undefined;
    const timer = setTimeout(() => setHighlightId(null), 2200);
    return () => clearTimeout(timer);
  }, [highlightId]);

  // 關閉選單後焦點回到 ☰ 按鈕
  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    menuButtonRef.current?.focus();
  }, []);

  function selectFromMenu(next) {
    setTab(next);
    closeMenu();
  }

  async function handleCreate(data) {
    const created = await api.create(data);
    setHighlightId(created.id);
    const createdMonth = data.date.slice(0, 7);
    // 新增到別的月份時切過去，讓使用者看得到剛新增的記錄
    if (createdMonth !== month) setMonth(createdMonth);
    else await refresh();
  }

  async function handleDelete(id) {
    try {
      await api.remove(id);
    } catch (err) {
      alert(err.message);
    }
    await refresh();
  }

  return (
    <div className="app">
      <header className="app-header">
        {/* ☰ 只在電腦寬度顯示；手機用下方頁籤（見 add-desktop-layout design.md 決策 1） */}
        <button
          ref={menuButtonRef}
          type="button"
          className="menu-button"
          aria-label="開啟頁面選單"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(true)}
        >
          ☰
        </button>
        <h1>
          記帳本<span className="page-name">・{TABS.find(([value]) => value === tab)[1]}</span>
        </h1>
      </header>

      {menuOpen && <NavDrawer items={TABS} active={tab} onSelect={selectFromMenu} onClose={closeMenu} />}

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'ledger' ? (
        <>
          {loadError && <p className="banner-error">{loadError}</p>}
          {/* 電腦：左欄統計＋表單、右欄明細；手機：單欄，表單與明細看起來是同一張卡片（spec: ledger-page） */}
          <main className="app-main ledger-layout">
            <div className="ledger-left">
              <MonthlySummary summary={summary}>
                <MonthPicker month={month} onChange={setMonth} />
              </MonthlySummary>
              <section className="card ledger-form-card">
                <TransactionForm onSubmit={handleCreate} />
              </section>
            </div>
            <section className="card ledger-list-card">
              <TransactionList transactions={transactions} onDelete={handleDelete} highlightId={highlightId} />
            </section>
          </main>
        </>
      ) : tab === 'calendar' ? (
        <CalendarPage />
      ) : (
        <ComparePage />
      )}
    </div>
  );
}
