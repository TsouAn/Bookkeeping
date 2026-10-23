const number = new Intl.NumberFormat('zh-TW');

// 50000 → '50,000'
export function formatMoney(amount) {
  return number.format(amount);
}

// 收入 '+50,000'、支出 '−120'
export function formatSigned(type, amount) {
  return `${type === 'income' ? '+' : '−'}${formatMoney(amount)}`;
}
