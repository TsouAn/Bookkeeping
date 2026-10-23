import { test } from 'node:test';
import assert from 'node:assert/strict';
import { openDb } from '../src/db.js';

test('以 :memory: 開啟後 transactions 資料表與索引存在', () => {
  const db = openDb(':memory:');
  const names = db
    .prepare(`SELECT name FROM sqlite_master WHERE type IN ('table','index')`)
    .all()
    .map((r) => r.name);
  assert.ok(names.includes('transactions'));
  assert.ok(names.includes('idx_transactions_date'));
});

test('資料庫本身拒絕金額 <= 0（最後一道防線）', () => {
  const db = openDb(':memory:');
  assert.throws(() =>
    db
      .prepare(`INSERT INTO transactions (type, amount, category, date) VALUES ('expense', 0, '餐飲', '2026-10-20')`)
      .run(),
  );
});
