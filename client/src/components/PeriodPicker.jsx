import { formatPeriod, isEnded, lastEnded, mondayOf, periodRange, shiftPeriod } from '../period.js';

// ‹ 期間文字 › 步進；日、週另有日期選擇器可直接跳轉。未結束的期間不能選（見 design.md 決策 5）
export default function PeriodPicker({ label, series, unit, value, today, onChange }) {
  const canGoNext = isEnded(unit, shiftPeriod(unit, value, 1), today);
  // 日期選擇器最多只能選到最後一個已結束期間的最後一天
  const maxDate = periodRange(unit, lastEnded(unit, today)).end;

  function handleDateInput(event) {
    const date = event.target.value;
    if (!date || date > maxDate) return;
    onChange(unit === 'week' ? mondayOf(date) : date);
  }

  return (
    <div className="period-picker">
      <span className="period-label">
        <span className={`swatch ${series}`} aria-hidden="true" />
        {label}
      </span>
      <div className="period-stepper">
        <button
          type="button"
          className="icon-button"
          aria-label={`${label}：上一期`}
          onClick={() => onChange(shiftPeriod(unit, value, -1))}
        >
          ‹
        </button>
        <span className="period-text">{formatPeriod(unit, value)}</span>
        <button
          type="button"
          className="icon-button"
          aria-label={`${label}：下一期`}
          disabled={!canGoNext}
          onClick={() => onChange(shiftPeriod(unit, value, 1))}
        >
          ›
        </button>
      </div>
      {unit !== 'month' && (
        <input
          type="date"
          className="period-date"
          aria-label={`${label}：選擇日期`}
          max={maxDate}
          value={unit === 'week' ? periodRange('week', value).start : value}
          onChange={handleDateInput}
        />
      )}
    </div>
  );
}
