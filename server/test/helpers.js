import { createApp } from '../src/app.js';
import { openDb } from '../src/db.js';

// 每個測試一個全新的記憶體資料庫，互不干擾
export function setup(options) {
  const db = openDb(':memory:');
  return { db, app: createApp(db, options) };
}

export const expense = (overrides = {}) => ({
  type: 'expense',
  amount: 120,
  category: '餐飲',
  date: '2026-10-20',
  note: '午餐',
  ...overrides,
});

export const income = (overrides = {}) => ({
  type: 'income',
  amount: 50000,
  category: '薪資',
  date: '2026-10-05',
  ...overrides,
});
