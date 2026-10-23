import { describe, expect, test } from 'vitest';
import { defaultPeriods, formatPeriod, isEnded, lastEnded, periodRange, shiftPeriod } from '../src/period.js';

const TODAY = '2026-10-20'; // 週二

describe('Requirement: 比較畫面 — 預設期間', () => {
  test('Scenario: 預設期間（月）', () => {
    expect(defaultPeriods('month', TODAY)).toEqual(['2026-08', '2026-09']);
  });

  test('Scenario: 週的預設期間', () => {
    const [a, b] = defaultPeriods('week', TODAY);
    expect(periodRange('week', a)).toEqual({ start: '2026-10-05', end: '2026-10-11' });
    expect(periodRange('week', b)).toEqual({ start: '2026-10-12', end: '2026-10-18' });
  });

  test('日的預設期間：前天 vs 昨天', () => {
    expect(defaultPeriods('day', TODAY)).toEqual(['2026-10-18', '2026-10-19']);
  });

  test('今天是週一時，上週已結束', () => {
    expect(lastEnded('week', '2026-10-19')).toBe('2026-10-12');
  });

  test('1 月時上個月是去年 12 月', () => {
    expect(defaultPeriods('month', '2027-01-05')).toEqual(['2026-11', '2026-12']);
  });
});

describe('上一期／下一期', () => {
  test('日', () => {
    expect(shiftPeriod('day', '2026-10-01', -1)).toBe('2026-09-30');
    expect(shiftPeriod('day', '2026-12-31', 1)).toBe('2027-01-01');
  });

  test('週（任何一天都先換算成週一）', () => {
    expect(shiftPeriod('week', '2026-10-15', -1)).toBe('2026-10-05');
    expect(shiftPeriod('week', '2026-12-28', 1)).toBe('2027-01-04');
  });

  test('月', () => {
    expect(shiftPeriod('month', '2026-01', -1)).toBe('2025-12');
    expect(shiftPeriod('month', '2026-12', 1)).toBe('2027-01');
  });
});

describe('是否已結束', () => {
  test('最後一個已結束期間的下一期就是未結束', () => {
    for (const unit of ['day', 'week', 'month']) {
      const last = lastEnded(unit, TODAY);
      expect(isEnded(unit, last, TODAY)).toBe(true);
      expect(isEnded(unit, shiftPeriod(unit, last, 1), TODAY)).toBe(false);
    }
  });
});

describe('期間顯示文字', () => {
  test('日／週／月', () => {
    expect(formatPeriod('day', '2026-10-18')).toBe('2026/10/18（日）');
    expect(formatPeriod('week', '2026-10-12')).toBe('2026/10/12（一）～10/18（日）');
    expect(formatPeriod('month', '2026-09')).toBe('2026 年 9 月');
  });

  test('跨年的週兩邊都顯示年份', () => {
    expect(formatPeriod('week', '2026-12-28')).toBe('2026/12/28（一）～2027/01/03（日）');
  });
});
