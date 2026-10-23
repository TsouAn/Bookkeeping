import { useRef } from 'react';
import { formatPeriod, isEnded, lastEnded, mondayOf, periodRange, shiftPeriod } from '../period.js';

// 一列顯示：色塊＋名稱、‹ 期間文字 ›、📅。未結束的期間不能選（見 design.md 決策 5）
export default function PeriodPicker({ label, series, unit, value, today, onChange }) {
  const dateRef = useRef(null);
  const canGoNext = isEnded(unit, shiftPeriod(unit, value, 1), today);
  // 日期選擇器最多只能選到最後一個已結束期間的最後一天
  const maxDate = periodRange(unit, lastEnded(unit, today)).end;

  function handleDateInput(event) {
    const date = event.target.value;
    if (!date || date > maxDate) return;
    onChange(unit === 'week' ? mondayOf(date) : date);
  }

  function openCalendar() {
    const input = dateRef.current;
    if (!input) return;
    // showPicker 不支援時退而求其次，讓輸入框取得焦點
    if (typeof input.showPicker === 'function') input.showPicker();
    else input.focus();
  }

  return (
    <div className="period-picker">
      <span className="period-label">
        <span className={`swatch ${series}`} aria-hidden="true" />
        {label}
      </span>
      <button
        type="button"
        className="step-button"
        aria-label={`${label}：上一期`}
        onClick={() => onChange(shiftPeriod(unit, value, -1))}
      >
        ‹
      </button>
      <span className="period-text">{formatPeriod(unit, value)}</span>
      <button
        type="button"
        className="step-button"
        aria-label={`${label}：下一期`}
        disabled={!canGoNext}
        onClick={() => onChange(shiftPeriod(unit, value, 1))}
      >
        ›
      </button>
      {unit === 'month' ? (
        <span className="calendar-slot" aria-hidden="true" />
      ) : (
        <span className="calendar-slot">
          <button type="button" className="step-button" aria-label={`${label}：選擇日期`} onClick={openCalendar}>
            📅
          </button>
          <input
            ref={dateRef}
            type="date"
            className="visually-hidden-date"
            tabIndex={-1}
            aria-hidden="true"
            max={maxDate}
            value={unit === 'week' ? periodRange('week', value).start : value}
            onChange={handleDateInput}
          />
        </span>
      )}
    </div>
  );
}
