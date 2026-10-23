import { describe, expect, test } from 'vitest';
import { formatMonth, shiftMonth, taipeiMonth } from '../src/time.js';
import { formatMoney, formatSigned } from '../src/format.js';

describe('time.js', () => {
  test('台灣時間跨月', () => {
    expect(taipeiMonth(new Date('2026-10-31T17:00:00Z'))).toBe('2026-11');
  });

  test('shiftMonth 跨年', () => {
    expect(shiftMonth('2026-01', -1)).toBe('2025-12');
    expect(shiftMonth('2026-12', 1)).toBe('2027-01');
    expect(shiftMonth('2026-10', 0)).toBe('2026-10');
  });

  test('formatMonth', () => {
    expect(formatMonth('2026-03')).toBe('2026 年 3 月');
  });
});

describe('format.js', () => {
  test('金額千分位', () => {
    expect(formatMoney(50000)).toBe('50,000');
    expect(formatMoney(-2000)).toBe('-2,000');
  });

  test('收入加號、支出減號', () => {
    expect(formatSigned('income', 50000)).toBe('+50,000');
    expect(formatSigned('expense', 120)).toBe('−120');
  });
});
