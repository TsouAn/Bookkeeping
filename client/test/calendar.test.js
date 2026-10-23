import { describe, expect, test } from 'vitest';
import { buildMonthGrid, compactMoney, summarizeByDay } from '../src/calendar.js';

describe('Requirement: 月曆與月份切換 — buildMonthGrid', () => {
  test('Scenario: 週一開頭的排列（2026-10，10/1 為週四）', () => {
    const grid = buildMonthGrid('2026-10');
    expect(grid.slice(0, 4)).toEqual([null, null, null, '2026-10-01']);
    expect(grid.length % 7).toBe(0);
    expect(grid.filter(Boolean)).toHaveLength(31);
    expect(grid.at(-1 - grid.slice().reverse().findIndex(Boolean))).toBe('2026-10-31');
  });

  test('2 月（28 天）', () => {
    const grid = buildMonthGrid('2026-02'); // 2/1 為週日
    expect(grid.slice(0, 7)).toEqual([null, null, null, null, null, null, '2026-02-01']);
    expect(grid.filter(Boolean)).toHaveLength(28);
  });

  test('1 號剛好是週一的月份不留前置空格', () => {
    const grid = buildMonthGrid('2026-06'); // 6/1 為週一
    expect(grid[0]).toBe('2026-06-01');
    expect(grid.filter(Boolean)).toHaveLength(30);
    expect(grid.length).toBe(35);
  });
});

// API 回傳順序：日期新到舊、同日較晚新增在前
const transactions = [
  { id: 4, type: 'income', amount: 1000, category: '薪資', date: '2026-10-22', note: '' },
  { id: 3, type: 'expense', amount: 20, category: '交通', date: '2026-10-22', note: '' },
  { id: 2, type: 'expense', amount: 50, category: '餐飲', date: '2026-10-22', note: '早餐' },
  { id: 1, type: 'expense', amount: 420, category: '餐飲', date: '2026-10-20', note: '' },
];

describe('Requirement: 每日收支合計／當日小計 — summarizeByDay', () => {
  const days = summarizeByDay(transactions);

  test('Scenario: 同一天有收入也有支出 → 支出 70、收入 1,000', () => {
    expect(days.get('2026-10-22')).toMatchObject({ income: 1000, expense: 70 });
  });

  test('Scenario: 只有支出 → 收入 0、支出 420、結餘 -420', () => {
    const day = days.get('2026-10-20');
    expect(day).toMatchObject({ income: 0, expense: 420 });
    expect(day.income - day.expense).toBe(-420);
  });

  test('Scenario: 點選有紀錄的日子 → 較晚新增的在前', () => {
    expect(days.get('2026-10-22').items.map((t) => t.id)).toEqual([4, 3, 2]);
  });

  test('Scenario: 沒有紀錄的日子 → 沒有資料', () => {
    expect(days.get('2026-10-21')).toBeUndefined();
  });
});

describe('格子金額縮寫', () => {
  test('未滿 10,000 原樣顯示，以上用「萬」', () => {
    expect(compactMoney(9_999)).toBe('9,999');
    expect(compactMoney(10_000)).toBe('1萬');
    expect(compactMoney(12_345)).toBe('1.2萬');
    expect(compactMoney(123_456)).toBe('12.3萬');
    expect(compactMoney(1_234_567)).toBe('123萬');
    expect(compactMoney(10_000_000)).toBe('1000萬');
  });
});
