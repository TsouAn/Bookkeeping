import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { openDb } from '../src/db.js';
import { expense } from './helpers.js';

test('Requirement: 資料持久保存 / Scenario: 重新啟動後資料仍在', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'expense-test-'));
  const path = join(dir, 'expense.db');
  try {
    const db1 = openDb(path);
    const created = await request(createApp(db1)).post('/api/transactions').send(expense());
    db1.close(); // 模擬伺服器關閉

    const db2 = openDb(path); // 模擬重新啟動
    const list = await request(createApp(db2)).get('/api/transactions');
    db2.close();
    assert.ok(list.body.some((t) => t.id === created.body.id));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
