// 用台灣時間計算「今天」，不受伺服器所在時區影響（見 design.md 決策 4）
const formatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Taipei',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export function taipeiToday(now = new Date()) {
  return formatter.format(now); // 2026-10-20
}

export function taipeiMonth(now = new Date()) {
  return taipeiToday(now).slice(0, 7); // 2026-10
}

// '2026-10' → ['2026-10-01', '2026-11-01']，用於 date >= start AND date < end
export function monthRange(month) {
  const [y, m] = month.split('-').map(Number);
  const nextY = m === 12 ? y + 1 : y;
  const nextM = m === 12 ? 1 : m + 1;
  return [`${month}-01`, `${nextY}-${String(nextM).padStart(2, '0')}-01`];
}
