// 與後端 server/src/period.js 相同的期間規則。後端是驗證依據，這裡只用來決定預設值與按鈕能否點選
import { shiftMonth } from './time.js';

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

function toUtc(date) {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function addDays(date, days) {
  const utc = toUtc(date);
  utc.setUTCDate(utc.getUTCDate() + days);
  return utc.toISOString().slice(0, 10);
}

function weekday(date) {
  return toUtc(date).getUTCDay();
}

export function mondayOf(date) {
  return addDays(date, -((weekday(date) + 6) % 7));
}

// 期間值 → { start, end }。週的值為該週週一
export function periodRange(unit, value) {
  if (unit === 'day') return { start: value, end: value };
  if (unit === 'week') {
    const start = mondayOf(value);
    return { start, end: addDays(start, 6) };
  }
  const [y, m] = value.split('-').map(Number);
  const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return { start: `${value}-01`, end: `${value}-${String(lastDay).padStart(2, '0')}` };
}

export function shiftPeriod(unit, value, delta) {
  if (unit === 'day') return addDays(value, delta);
  if (unit === 'week') return addDays(mondayOf(value), delta * 7);
  return shiftMonth(value, delta);
}

export function isEnded(unit, value, today) {
  return periodRange(unit, value).end < today;
}

// 最近一個已結束的期間：昨天／上週／上個月
export function lastEnded(unit, today) {
  if (unit === 'day') return addDays(today, -1);
  if (unit === 'week') return addDays(mondayOf(today), -7);
  return shiftMonth(today.slice(0, 7), -1);
}

// 預設比較最近兩個已結束的期間，期間一較早
export function defaultPeriods(unit, today) {
  const b = lastEnded(unit, today);
  return [shiftPeriod(unit, b, -1), b];
}

function formatDay(date, withYear) {
  const [y, m, d] = date.split('-');
  const md = `${m}/${d}（${WEEKDAYS[weekday(date)]}）`;
  return withYear ? `${y}/${md}` : md;
}

// day：2026/10/18（日）；week：2026/10/12（一）～10/18（日）；month：2026 年 9 月
export function formatPeriod(unit, value) {
  if (unit === 'day') return formatDay(value, true);
  if (unit === 'week') {
    const { start, end } = periodRange('week', value);
    const sameYear = start.slice(0, 4) === end.slice(0, 4);
    return `${formatDay(start, true)}～${formatDay(end, !sameYear)}`;
  }
  const [y, m] = value.split('-');
  return `${y} 年 ${Number(m)} 月`;
}
