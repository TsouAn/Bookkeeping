import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { expense, income, setup } from './helpers.js';

describe('Requirement: 新增收支記錄', () => {
  test('Scenario: 新增支出成功', async () => {
    const { app } = setup();
    const res = await request(app).post('/api/transactions').send(expense());
    assert.equal(res.status, 201);
    assert.equal(typeof res.body.id, 'number');
    assert.deepEqual(
      { type: res.body.type, amount: res.body.amount, category: res.body.category, date: res.body.date, note: res.body.note },
      expense(),
    );
  });

  test('Scenario: 新增收入成功', async () => {
    const { app } = setup();
    const res = await request(app).post('/api/transactions').send(income());
    assert.equal(res.status, 201);
    assert.equal(res.body.type, 'income');
    assert.equal(res.body.note, '');
  });

  test('Scenario: 新增後立即可在列表看到', async () => {
    const { app } = setup();
    const created = await request(app).post('/api/transactions').send(expense());
    const list = await request(app).get('/api/transactions');
    assert.ok(list.body.some((t) => t.id === created.body.id));
  });

  test('驗證失敗回 400 + 錯誤訊息，且不寫入資料', async () => {
    const { app } = setup();
    const res = await request(app).post('/api/transactions').send(expense({ amount: 99.5 }));
    assert.equal(res.status, 400);
    assert.deepEqual(res.body, { error: '金額必須是大於 0 的整數' });
    const list = await request(app).get('/api/transactions');
    assert.deepEqual(list.body, []);
  });

  test('非 JSON 內容回 400', async () => {
    const { app } = setup();
    const res = await request(app)
      .post('/api/transactions')
      .set('Content-Type', 'application/json')
      .send('{壞掉的');
    assert.equal(res.status, 400);
    assert.ok(res.body.error);
  });
});

describe('Requirement: 收支列表', () => {
  test('Scenario: 依日期新到舊排序', async () => {
    const { app } = setup();
    for (const date of ['2026-10-01', '2026-10-15', '2026-10-08']) {
      await request(app).post('/api/transactions').send(expense({ date }));
    }
    const res = await request(app).get('/api/transactions');
    assert.deepEqual(
      res.body.map((t) => t.date),
      ['2026-10-15', '2026-10-08', '2026-10-01'],
    );
  });

  test('同日期時較晚新增者在前', async () => {
    const { app } = setup();
    await request(app).post('/api/transactions').send(expense({ note: '早' }));
    await request(app).post('/api/transactions').send(expense({ note: '晚' }));
    const res = await request(app).get('/api/transactions');
    assert.deepEqual(res.body.map((t) => t.note), ['晚', '早']);
  });

  test('Scenario: 依月份篩選', async () => {
    const { app } = setup();
    await request(app).post('/api/transactions').send(expense({ date: '2026-09-30' }));
    await request(app).post('/api/transactions').send(expense({ date: '2026-10-01' }));
    await request(app).post('/api/transactions').send(expense({ date: '2026-10-31' }));
    await request(app).post('/api/transactions').send(expense({ date: '2026-11-01' }));
    const res = await request(app).get('/api/transactions?month=2026-10');
    assert.deepEqual(res.body.map((t) => t.date), ['2026-10-31', '2026-10-01']);
  });

  test('跨年：12 月篩選', async () => {
    const { app } = setup();
    await request(app).post('/api/transactions').send(expense({ date: '2026-12-31' }));
    await request(app).post('/api/transactions').send(expense({ date: '2027-01-01' }));
    const res = await request(app).get('/api/transactions?month=2026-12');
    assert.deepEqual(res.body.map((t) => t.date), ['2026-12-31']);
  });

  test('Scenario: 沒有任何記錄', async () => {
    const { app } = setup();
    const res = await request(app).get('/api/transactions');
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, []);
  });

  test('月份格式錯誤回 400', async () => {
    const { app } = setup();
    const res = await request(app).get('/api/transactions?month=2026-13');
    assert.equal(res.status, 400);
    assert.deepEqual(res.body, { error: '月份格式必須是 YYYY-MM' });
  });
});

describe('Requirement: 刪除收支記錄', () => {
  test('Scenario: 刪除成功', async () => {
    const { app } = setup();
    const created = await request(app).post('/api/transactions').send(expense());
    const res = await request(app).delete(`/api/transactions/${created.body.id}`);
    assert.equal(res.status, 204);
    const list = await request(app).get('/api/transactions');
    assert.ok(!list.body.some((t) => t.id === created.body.id));
  });

  test('Scenario: 刪除不存在的記錄', async () => {
    const { app } = setup();
    for (const id of ['999', 'abc']) {
      const res = await request(app).delete(`/api/transactions/${id}`);
      assert.equal(res.status, 404);
      assert.deepEqual(res.body, { error: '找不到此筆記錄' });
    }
  });
});
