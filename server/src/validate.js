import { CATEGORIES } from './categories.js';

export const MAX_AMOUNT = 10_000_000;
export const MAX_NOTE_LENGTH = 100;

// 檢查 YYYY-MM-DD 格式且是真實存在的日期（排除 2026-02-30 這種）
export function isValidDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

export function isValidMonth(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}$/.test(value)) return false;
  const m = Number(value.slice(5));
  return m >= 1 && m <= 12;
}

// 回傳 { error } 或 { value }（整理後可直接寫入的資料）
export function validateTransaction(input) {
  const { type, amount, category, date } = input ?? {};
  const note = input?.note ?? '';

  if (type !== 'income' && type !== 'expense') {
    return { error: '類型必須是 income 或 expense' };
  }
  if (!Number.isInteger(amount) || amount <= 0) {
    return { error: '金額必須是大於 0 的整數' };
  }
  if (amount > MAX_AMOUNT) {
    return { error: '金額不可超過 10,000,000' };
  }
  if (!CATEGORIES[type].includes(category)) {
    return { error: '分類不屬於此類型' };
  }
  if (!isValidDate(date)) {
    return { error: '日期格式必須是 YYYY-MM-DD' };
  }
  if (typeof note !== 'string' || [...note].length > MAX_NOTE_LENGTH) {
    return { error: '備註不可超過 100 字' };
  }
  return { value: { type, amount, category, date, note } };
}
