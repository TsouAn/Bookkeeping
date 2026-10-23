import { buildMonthGrid, compactMoney } from '../calendar.js';
import { formatMoney } from '../format.js';

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'];

// 7 欄月曆：每格顯示日期、當天支出（綠 −）與收入（紅 +）
export default function MonthCalendar({ month, days, today, selectedDate, onSelect }) {
  const cells = buildMonthGrid(month);

  return (
    <div className="month-calendar">
      <div className="calendar-weekdays" aria-hidden="true">
        {WEEKDAYS.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>
      <div className="calendar-grid" role="grid" aria-label="月曆">
        {cells.map((date, i) => {
          if (!date) return <span key={`empty-${i}`} className="calendar-cell empty-cell" aria-hidden="true" />;
          const day = days.get(date);
          const [, m, d] = date.split('-').map(Number);
          const label = [
            `${m}月${d}日`,
            day?.expense ? `支出 ${formatMoney(day.expense)}` : '',
            day?.income ? `收入 ${formatMoney(day.income)}` : '',
          ]
            .filter(Boolean)
            .join(' ');
          const classes = ['calendar-cell', date === today && 'is-today', date === selectedDate && 'is-selected']
            .filter(Boolean)
            .join(' ');
          return (
            <button
              key={date}
              type="button"
              className={classes}
              aria-label={label}
              aria-pressed={date === selectedDate}
              onClick={() => onSelect(date)}
            >
              <span className="cell-day">{d}</span>
              {day?.expense > 0 && <span className="cell-amount expense">−{compactMoney(day.expense)}</span>}
              {day?.income > 0 && <span className="cell-amount income">+{compactMoney(day.income)}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
