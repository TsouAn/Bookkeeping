import { formatMoney } from './format.js';

// 差額的箭頭與好壞：支出增加是壞事，收入、結餘增加是好事（見 design.md 決策 6）
export function trend(kind, amount) {
  if (amount === 0) return { arrow: '', tone: 'neutral' };
  const up = amount > 0;
  const good = kind === 'expense' ? !up : up;
  return { arrow: up ? '↑' : '↓', tone: good ? 'good' : 'bad' };
}

// 14.3 → '+14.3%'、-25 → '-25%'、null → '—'
export function formatPercent(percent) {
  if (percent === null || percent === undefined) return '—';
  return `${percent > 0 ? '+' : ''}${percent}%`;
}

// 400 → '↑400'、-250 → '↓250'、0 → '0'
export function formatDiff(amount) {
  if (amount === 0) return '0';
  return `${amount > 0 ? '↑' : '↓'}${formatMoney(Math.abs(amount))}`;
}
