import { describe, expect, test } from 'vitest';
import { formatDiff, formatPercent, trend } from '../src/trend.js';

describe('Requirement: 比較結果呈現', () => {
  test('Scenario: 支出增加的標示 → 紅色 ↑400（+14.3%）', () => {
    expect(trend('expense', 400)).toEqual({ arrow: '↑', tone: 'bad' });
    expect(`${formatDiff(400)}（${formatPercent(14.3)}）`).toBe('↑400（+14.3%）');
  });

  test('Scenario: 收入增加的標示 → 綠色 ↑2,000（+10%）', () => {
    expect(trend('income', 2000)).toEqual({ arrow: '↑', tone: 'good' });
    expect(`${formatDiff(2000)}（${formatPercent(10)}）`).toBe('↑2,000（+10%）');
  });

  test('支出減少為綠色、收入減少為紅色', () => {
    expect(trend('expense', -250).tone).toBe('good');
    expect(trend('income', -250).tone).toBe('bad');
    expect(formatDiff(-250)).toBe('↓250');
    expect(formatPercent(-25)).toBe('-25%');
  });

  test('結餘增加為好事', () => {
    expect(trend('balance', 800)).toEqual({ arrow: '↑', tone: 'good' });
  });

  test('差額為 0 沒有箭頭', () => {
    expect(trend('expense', 0)).toEqual({ arrow: '', tone: 'neutral' });
    expect(formatDiff(0)).toBe('0');
  });

  test('Scenario: 百分比無法計算', () => {
    expect(formatPercent(null)).toBe('—');
  });
});
