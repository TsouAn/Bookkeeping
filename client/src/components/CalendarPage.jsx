import { useEffect, useMemo, useState } from 'react';
import { api } from '../api.js';
import { summarizeByDay } from '../calendar.js';
import { taipeiMonth, taipeiToday } from '../time.js';
import DayDetail from './DayDetail.jsx';
import MonthCalendar from './MonthCalendar.jsx';
import MonthPicker from './MonthPicker.jsx';
import './Calendar.css';

// 日曆頁：狀態放在頁內，每次切到這個頁籤都重新抓資料（見 add-calendar-view design.md 決策 3）
export default function CalendarPage() {
  const [today] = useState(() => taipeiToday());
  const [month, setMonth] = useState(() => taipeiMonth());
  const [selectedDate, setSelectedDate] = useState(today);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    api
      .list(month)
      .then((list) => {
        if (cancelled) return;
        setTransactions(list);
        setError('');
      })
      .catch((err) => {
        if (!cancelled) setError(`無法載入資料：${err.message}。請確認後端是否已啟動。`);
      });
    return () => {
      cancelled = true;
    };
  }, [month]);

  const days = useMemo(() => summarizeByDay(transactions), [transactions]);

  // 切回本月選今天，其他月份選 1 號
  function changeMonth(next) {
    setMonth(next);
    setSelectedDate(next === today.slice(0, 7) ? today : `${next}-01`);
  }

  return (
    <main className="app-main">
      <section className="card calendar-card">
        <div className="calendar-header">
          <MonthPicker month={month} onChange={changeMonth} />
        </div>
        <MonthCalendar month={month} days={days} today={today} selectedDate={selectedDate} onSelect={setSelectedDate} />
      </section>

      {error && <p className="banner-error">{error}</p>}

      <DayDetail date={selectedDate} day={days.get(selectedDate)} />
    </main>
  );
}
