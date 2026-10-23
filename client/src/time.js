// 台灣時間的今天與本月（見 design.md 決策 4）
const formatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Taipei',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export function taipeiToday(now = new Date()) {
  return formatter.format(now);
}

export function taipeiMonth(now = new Date()) {
  return taipeiToday(now).slice(0, 7);
}

// shiftMonth('2026-01', -1) → '2025-12'
export function shiftMonth(month, delta) {
  const [y, m] = month.split('-').map(Number);
  const index = y * 12 + (m - 1) + delta;
  const year = Math.floor(index / 12);
  const mon = (index % 12) + 1;
  return `${year}-${String(mon).padStart(2, '0')}`;
}

// '2026-10' → '2026 年 10 月'
export function formatMonth(month) {
  const [y, m] = month.split('-');
  return `${y} 年 ${Number(m)} 月`;
}
