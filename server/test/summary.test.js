import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { taipeiMonth, taipeiToday } from '../src/time.js';
import { expense, income, setup } from './helpers.js';

async function add(app, ...items) {
  for (const item of items) {
    const res = await request(app).post('/api/transactions').send(item);
    assert.equal(res.status, 201);
  }
}

describe('台灣時間工具', () => {
  test('UTC 2026-10-31T17:00Z 在台灣已是 11 月', () => {
    const now = new Date('2026-10-31T17:00:00Z');
    assert.equal(taipeiToday(now), '2026-11-01');
    assert.equal(taipeiMonth(now), '2026-11');
  });

  test('UTC 2026-10-31T15:59Z 在台灣仍是 10 月', () => {
    assert.equal(taipeiMonth(new Date('2026-10-31T15:59:00Z')), '2026-10');
  });
});

describe('Requirement: 月份收支總計', () => {
  test('Scenario: 有收入也有支出', async () => {
    const { app } = setup();
    await add(app, income(), expense({ amount: 120 }), expense({ amount: 380 }));
    const res = await request(app).get('/api/summary?month=2026-10');
    assert.equal(res.status, 200);
    assert.equal(res.body.income, 50000);
    assert.equal(res.body.expense, 500);
    assert.equal(res.body.balance, 49500);
  });

  test('Scenario: 支出大於收入', async () => {
    const { app } = setup();
    await add(app, income({ amount: 1000 }), expense({ amount: 3000 }));
    const res = await request(app).get('/api/summary?month=2026-10');
    assert.equal(res.body.balance, -2000);
  });

  test('Scenario: 該月沒有任何記錄', async () => {
    const { app } = setup();
    const res = await request(app).get('/api/summary?month=2026-10');
    assert.deepEqual(res.body, { month: '2026-10', income: 0, expense: 0, balance: 0, byCategory: [] });
  });

  test('Scenario: 只計算指定月份', async () => {
    const { app } = setup();
    await add(app, expense({ amount: 100, date: '2026-09-30' }), expense({ amount: 100, date: '2026-10-01' }));
    const res = await request(app).get('/api/summary?month=2026-10');
    assert.equal(res.body.expense, 100);
  });

  test('Scenario: 未指定月份時使用台灣時間當月', async () => {
    const { app } = setup({ now: () => new Date('2026-10-31T17:00:00Z') });
    await add(app, expense({ amount: 200, date: '2026-11-01' }), expense({ amount: 999, date: '2026-10-31' }));
    const res = await request(app).get('/api/summary');
    assert.equal(res.body.month, '2026-11');
    assert.equal(res.body.expense, 200);
  });

  test('Scenario: 月份格式錯誤', async () => {
    const { app } = setup();
    for (const month of ['2026-13', '202610']) {
      const res = await request(app).get(`/api/summary?month=${month}`);
      assert.equal(res.status, 400);
      assert.deepEqual(res.body, { error: '月份格式必須是 YYYY-MM' });
    }
  });
});

describe('Requirement: 支出分類小計', () => {
  test('Scenario: 分類小計排序', async () => {
    const { app } = setup();
    await add(
      app,
      expense({ category: '餐飲', amount: 120 }),
      expense({ category: '交通', amount: 500 }),
      expense({ category: '餐飲', amount: 80 }),
    );
    const res = await request(app).get('/api/summary?month=2026-10');
    assert.deepEqual(res.body.byCategory, [
      { category: '交通', amount: 500 },
      { category: '餐飲', amount: 200 },
    ]);
  });

  test('Scenario: 收入不列入分類小計', async () => {
    const { app } = setup();
    await add(app, income({ category: '薪資' }), expense({ category: '餐飲', amount: 100 }));
    const res = await request(app).get('/api/summary?month=2026-10');
    assert.deepEqual(res.body.byCategory, [{ category: '餐飲', amount: 100 }]);
  });
});
