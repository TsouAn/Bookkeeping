import { formatMonth, shiftMonth, taipeiMonth } from '../time.js';

export default function MonthPicker({ month, onChange }) {
  const isCurrent = month === taipeiMonth();

  return (
    <div className="month-picker">
      <button type="button" className="icon-button" aria-label="上個月" onClick={() => onChange(shiftMonth(month, -1))}>
        ‹
      </button>
      <span className="month-label">{formatMonth(month)}</span>
      <button type="button" className="icon-button" aria-label="下個月" onClick={() => onChange(shiftMonth(month, 1))}>
        ›
      </button>
      {!isCurrent && (
        <button type="button" className="link-button" onClick={() => onChange(taipeiMonth())}>
          回本月
        </button>
      )}
    </div>
  );
}
