import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { defaultPeriods } from '../period.js';
import { taipeiToday } from '../time.js';
import CategoryCompareChart from './CategoryCompareChart.jsx';
import CompareTable from './CompareTable.jsx';
import PeriodPicker from './PeriodPicker.jsx';

const UNITS = [
  ['day', '日'],
  ['week', '週'],
  ['month', '月'],
];

export default function ComparePage() {
  const [today] = useState(() => taipeiToday());
  const [unit, setUnit] = useState('month');
  const [periods, setPeriods] = useState(() => defaultPeriods('month', today));
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // 更新其中一期時用函式型更新，避免拿到舊的另一期而互相覆蓋
  const [a, b] = periods;

  // 切換單位時重設為該單位最近兩個已結束的期間（spec: 比較畫面）
  function changeUnit(next) {
    setUnit(next);
    setPeriods(defaultPeriods(next, today));
  }

  useEffect(() => {
    let cancelled = false;
    api
      .compare(unit, a, b)
      .then((data) => {
        if (cancelled) return;
        setResult(data);
        setError('');
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });
    // 快速切換時忽略舊的回應，避免舊結果蓋掉新結果
    return () => {
      cancelled = true;
    };
  }, [unit, a, b]);

  return (
    <main className="app-main">
      <section className="card compare-controls">
        <div className="type-toggle unit-toggle" role="radiogroup" aria-label="比較單位">
          {UNITS.map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={unit === value}
              className={`toggle ${unit === value ? 'active unit' : ''}`}
              onClick={() => changeUnit(value)}
            >
              {label}
            </button>
          ))}
        </div>
        <PeriodPicker
          label="期間一"
          series="series-a"
          unit={unit}
          value={a}
          today={today}
          onChange={(value) => setPeriods(([, prevB]) => [value, prevB])}
        />
        <PeriodPicker
          label="期間二"
          series="series-b"
          unit={unit}
          value={b}
          today={today}
          onChange={(value) => setPeriods(([prevA]) => [prevA, value])}
        />
      </section>

      {error && <p className="banner-error">{error}</p>}

      {result && (
        <>
          <CompareTable result={result} />
          <CategoryCompareChart byCategory={result.byCategory} />
        </>
      )}
    </main>
  );
}
