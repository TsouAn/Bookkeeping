import { formatMoney } from './format.js';

// 差額只看方向：增加紅（up）、減少綠（down），台灣股市慣例（見 design.md 決策 6）
export function trend(amount) {
  if (amount === 0) return { arrow: '', tone: 'neutral' };
  return amount > 0 ? { arrow: '↑', tone: 'up' } : { arrow: '↓', tone: 'down' };
}

// 合計金額不是變化量，不加箭頭，只依正負上色：正紅、負綠（見 design.md 決策 6）
export function signTone(amount) {
  if (amount === 0) return 'neutral';
  return amount > 0 ? 'up' : 'down';
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
