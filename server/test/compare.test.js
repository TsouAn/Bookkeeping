import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { expense, income, setup } from './helpers.js';

// 台灣時間 2026-10-20（週二）
const NOW = () => new Date('2026-10-20T04:00:00Z');

async function add(app, ...items) {
  for (const item of items) {
    const res = await request(app).post('/api/transactions').send(item);
    assert.equal(res.status, 201);
  }
}

function compare(app, unit, a, b) {
  const params = new URLSearchParams();
  if (unit !== undefined) params.set('unit', unit);
  if (a !== undefined) params.set('a', a);
  if (b !== undefined) params.set('b', b);
  return request(app).get(`/api/compare?${params}`);
}

describe('Requirement: 只能比較已結束的期間（API）', () => {
  test('Scenario: 昨天可以比較', async () => {
    const { app } = setup({ now: NOW });
    const res = await compare(app, 'day', '2026-10-18', '2026-10-19');
    assert.equal(res.status, 200);
  });

  for (const [name, unit, value] of [
    ['今天', 'day', '2026-10-20'],
    ['未來', 'day', '2026-12-01'],
    ['本週', 'week', '2026-10-19'],
    ['本月', 'month', '2026-10'],
  ]) {
    test(`${name}不能比較`, async () => {
      const { app } = setup({ now: NOW });
      const res = await compare(app, unit, value, value);
      assert.equal(res.status, 400);
      assert.deepEqual(res.body, { error: '只能比較已經結束的期間' });
    });
  }

  test('Scenario: 上週日結束後即可比較', async () => {
    const { app } = setup({ now: () => new Date('2026-10-19T04:00:00Z') });
    const res = await compare(app, 'week', '2026-10-05', '2026-10-12');
    assert.equal(res.status, 200);
    assert.deepEqual([res.body.b.start, res.body.b.end], ['2026-10-12', '2026-10-18']);
  });

  test('未結束只要有一期就拒絕', async () => {
    const { app } = setup({ now: NOW });
    const res = await compare(app, 'month', '2026-09', '2026-10');
    assert.equal(res.status, 400);
  });
});

describe('Requirement: 參數驗證', () => {
  test('Scenario: 單位不合法', async () => {
    const { app } = setup({ now: NOW });
    const res = await compare(app, 'year', '2025', '2024');
    assert.equal(res.status, 400);
    assert.deepEqual(res.body, { error: '比較單位必須是 day、week 或 month' });
  });

  test('Scenario: 期間格式不符合單位', async () => {
    const { app } = setup({ now: NOW });
    for (const [unit, a, b] of [
      ['month', '2026-10-15', '2026-09'],
      ['day', '2026-10', '2026-10-01'],
    ]) {
      const res = await compare(app, unit, a, b);
      assert.equal(res.status, 400);
      assert.deepEqual(res.body, { error: '期間格式不正確' });
    }
  });

  test('Scenario: 缺少期間', async () => {
    const { app } = setup({ now: NOW });
    const res = await compare(app, 'day', '2026-10-18');
    assert.equal(res.status, 400);
    assert.deepEqual(res.body, { error: '期間格式不正確' });
  });
});

describe('Requirement: 總額比較', () => {
  test('回傳兩期起訖日期（週會換算成週一到週日）', async () => {
    const { app } = setup({ now: NOW });
    const res = await compare(app, 'week', '2026-10-08', '2026-10-15');
    assert.equal(res.body.unit, 'week');
    assert.deepEqual([res.body.a.start, res.body.a.end], ['2026-10-05', '2026-10-11']);
    assert.deepEqual([res.body.b.start, res.body.b.end], ['2026-10-12', '2026-10-18']);
  });

  test('Scenario: 支出增加', async () => {
    const { app } = setup({ now: NOW });
    await add(app, expense({ amount: 2800, date: '2026-10-08' }), expense({ amount: 3200, date: '2026-10-15' }));
    const res = await compare(app, 'week', '2026-10-05', '2026-10-12');
    assert.equal(res.body.a.expense, 2800);
    assert.equal(res.body.b.expense, 3200);
    assert.deepEqual(res.body.diff.expense, { amount: 400, percent: 14.3 });
  });

  test('Scenario: 支出減少', async () => {
    const { app } = setup({ now: NOW });
    await add(app, expense({ amount: 1000, date: '2026-08-10' }), expense({ amount: 750, date: '2026-09-10' }));
    const res = await compare(app, 'month', '2026-08', '2026-09');
    assert.deepEqual(res.body.diff.expense, { amount: -250, percent: -25 });
  });

  test('Scenario: 期間一為 0', async () => {
    const { app } = setup({ now: NOW });
    await add(app, income({ amount: 5000, date: '2026-10-19' }));
    const res = await compare(app, 'day', '2026-10-18', '2026-10-19');
    assert.deepEqual(res.body.diff.income, { amount: 5000, percent: null });
  });

  test('Scenario: 結餘顯示兩期合計', async () => {
    const { app } = setup({ now: NOW });
    await add(
      app,
      expense({ amount: 420, date: '2026-10-18' }),
      income({ amount: 1000, date: '2026-10-19' }),
    );
    const res = await compare(app, 'day', '2026-10-18', '2026-10-19');
    assert.equal(res.body.a.balance, -420);
    assert.equal(res.body.b.balance, 1000);
    assert.equal(res.body.combinedBalance, 580);
    assert.equal(res.body.diff.balance, undefined); // 結餘沒有差額與百分比
  });

  test('Scenario: 兩期合計結餘為負', async () => {
    const { app } = setup({ now: NOW });
    await add(
      app,
      expense({ amount: 500, date: '2026-10-18' }),
      income({ amount: 300, date: '2026-10-19' }),
    );
    const res = await compare(app, 'day', '2026-10-18', '2026-10-19');
    assert.equal(res.body.combinedBalance, -200);
  });

  test('Scenario: 兩個期間都沒有記錄', async () => {
    const { app } = setup({ now: NOW });
    const res = await compare(app, 'day', '2026-10-18', '2026-10-19');
    for (const p of [res.body.a, res.body.b]) {
      assert.deepEqual([p.income, p.expense, p.balance], [0, 0, 0]);
    }
    assert.deepEqual(res.body.diff, {
      income: { amount: 0, percent: null },
      expense: { amount: 0, percent: null },
    });
    assert.equal(res.body.combinedBalance, 0);
    assert.deepEqual(res.body.byCategory, []);
  });

  test('只計算期間內的記錄（週的邊界）', async () => {
    const { app } = setup({ now: NOW });
    await add(
      app,
      expense({ amount: 1, date: '2026-10-11' }), // 上上週日
      expense({ amount: 10, date: '2026-10-12' }), // 上週一
      expense({ amount: 100, date: '2026-10-18' }), // 上週日
      expense({ amount: 1000, date: '2026-10-19' }), // 本週一
    );
    const res = await compare(app, 'week', '2026-10-05', '2026-10-12');
    assert.equal(res.body.a.expense, 1);
    assert.equal(res.body.b.expense, 110);
  });
});

describe('Requirement: 支出分類比較', () => {
  test('Scenario: 分類只出現在其中一期', async () => {
    const { app } = setup({ now: NOW });
    await add(
      app,
      expense({ category: '餐飲', amount: 300, date: '2026-08-05' }),
      expense({ category: '餐飲', amount: 500, date: '2026-09-05' }),
      expense({ category: '交通', amount: 200, date: '2026-09-06' }),
    );
    const res = await compare(app, 'month', '2026-08', '2026-09');
    assert.deepEqual(res.body.byCategory, [
      { category: '餐飲', a: 300, b: 500, diff: 200 },
      { category: '交通', a: 0, b: 200, diff: 200 },
    ]);
  });

  test('Scenario: 依兩期較大金額排序', async () => {
    const { app } = setup({ now: NOW });
    await add(
      app,
      expense({ category: '交通', amount: 900, date: '2026-10-18' }),
      expense({ category: '餐飲', amount: 100, date: '2026-10-18' }),
      expense({ category: '交通', amount: 100, date: '2026-10-19' }),
      expense({ category: '餐飲', amount: 500, date: '2026-10-19' }),
    );
    const res = await compare(app, 'day', '2026-10-18', '2026-10-19');
    assert.deepEqual(res.body.byCategory.map((c) => c.category), ['交通', '餐飲']);
  });

  test('Scenario: 收入不列入分類比較', async () => {
    const { app } = setup({ now: NOW });
    await add(
      app,
      income({ category: '薪資', date: '2026-10-18' }),
      income({ category: '薪資', date: '2026-10-19' }),
      expense({ category: '餐飲', amount: 100, date: '2026-10-19' }),
    );
    const res = await compare(app, 'day', '2026-10-18', '2026-10-19');
    assert.deepEqual(res.body.byCategory.map((c) => c.category), ['餐飲']);
  });
});
