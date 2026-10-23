// 日曆用的純函式（見 add-calendar-view design.md 決策 1、2、5）
import { formatMoney } from './format.js';

function toUtc(date) {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

// '2026-10' → 月曆格子：週一開頭，該月以外的位置為 null，長度為 7 的倍數
export function buildMonthGrid(month) {
  const [y, m] = month.split('-').map(Number);
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const leading = (toUtc(`${month}-01`).getUTCDay() + 6) % 7; // 週一為 0
  const cells = Array(leading).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(`${month}-${String(d).padStart(2, '0')}`);
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

// 整月紀錄 → Map<date, { income, expense, items }>；items 保留 API 順序（同日較晚新增在前）
export function summarizeByDay(transactions) {
  const days = new Map();
  for (const t of transactions) {
    if (!days.has(t.date)) days.set(t.date, { income: 0, expense: 0, items: [] });
    const day = days.get(t.date);
    day[t.type] += t.amount;
    day.items.push(t);
  }
  return days;
}

// 格子空間小，≥ 10,000 改用「萬」：12345 → '1.2萬'（375px 寬度下最長只到「−9,999」）
export function compactMoney(amount) {
  if (amount < 10_000) return formatMoney(amount);
  // 百萬以上不留小數，避免「−999.9萬」被截斷：1234567 → '123萬'
  if (amount >= 1_000_000) return `${Math.round(amount / 10_000)}萬`;
  return `${(Math.round(amount / 1000) / 10).toString()}萬`;
}
