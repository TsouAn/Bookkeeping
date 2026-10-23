import { isValidDate, isValidMonth } from './validate.js';

export const UNITS = ['day', 'week', 'month'];

// 全程用 UTC 做日期運算，避免伺服器時區造成日期偏移（見 design.md 決策 2）
function toUtc(date) {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function fromUtc(utc) {
  return utc.toISOString().slice(0, 10);
}

export function addDays(date, days) {
  const utc = toUtc(date);
  utc.setUTCDate(utc.getUTCDate() + days);
  return fromUtc(utc);
}

// 期間字串 → { start, end }；格式不符合該單位時回傳 null
export function periodRange(unit, value) {
  if (unit === 'day') {
    return isValidDate(value) ? { start: value, end: value } : null;
  }
  if (unit === 'week') {
    if (!isValidDate(value)) return null;
    const weekday = toUtc(value).getUTCDay(); // 週日 0、週一 1 … 週六 6
    const start = addDays(value, -((weekday + 6) % 7));
    return { start, end: addDays(start, 6) };
  }
  if (unit === 'month') {
    if (!isValidMonth(value)) return null;
    const [y, m] = value.split('-').map(Number);
    const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate();
    return { start: `${value}-01`, end: `${value}-${String(lastDay).padStart(2, '0')}` };
  }
  return null;
}

// 結束日早於今天（台灣時間）才算已結束。格式固定為 YYYY-MM-DD，可直接比較字串
export function isPeriodEnded(range, today) {
  return range.end < today;
}
