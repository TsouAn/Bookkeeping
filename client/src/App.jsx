import { useCallback, useEffect, useState } from 'react';
import { api } from './api.js';
import { taipeiMonth } from './time.js';
import CalendarPage from './components/CalendarPage.jsx';
import ComparePage from './components/ComparePage.jsx';
import MonthPicker from './components/MonthPicker.jsx';
import MonthlySummary from './components/MonthlySummary.jsx';
import Tabs from './components/Tabs.jsx';
import TransactionForm from './components/TransactionForm.jsx';
import TransactionList from './components/TransactionList.jsx';

// 頁籤種類與順序見 openspec/specs/app-navigation
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

  async function handleCreate(data) {
    await api.create(data);
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
        <h1>記帳本</h1>
        {tab === 'ledger' && <MonthPicker month={month} onChange={setMonth} />}
      </header>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'ledger' ? (
        <>
          {loadError && <p className="banner-error">{loadError}</p>}
          <main className="app-main">
            <MonthlySummary summary={summary} />
            <TransactionForm onSubmit={handleCreate} />
            <TransactionList transactions={transactions} onDelete={handleDelete} />
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
