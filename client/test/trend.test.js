import { describe, expect, test } from 'vitest';
import { formatDiff, formatPercent, signTone, trend } from '../src/trend.js';

describe('Requirement: 比較結果呈現', () => {
  test('Scenario: 支出增加的標示 → 紅色 ↑400（+14.3%）', () => {
    expect(trend(400)).toEqual({ arrow: '↑', tone: 'up' });
    expect(`${formatDiff(400)}（${formatPercent(14.3)}）`).toBe('↑400（+14.3%）');
  });

  test('Scenario: 收入增加的標示 → 也是紅色 ↑2,000（+10%）', () => {
    expect(trend(2000)).toEqual({ arrow: '↑', tone: 'up' });
    expect(`${formatDiff(2000)}（${formatPercent(10)}）`).toBe('↑2,000（+10%）');
  });

  test('Scenario: 減少的標示 → 綠色 ↓250（-25%）與 ↓200', () => {
    expect(trend(-250)).toEqual({ arrow: '↓', tone: 'down' });
    expect(`${formatDiff(-250)}（${formatPercent(-25)}）`).toBe('↓250（-25%）');
    expect(trend(-200).tone).toBe('down');
    expect(formatDiff(-200)).toBe('↓200');
  });

  test('Scenario: 沒有變化 → 中性色 0，沒有箭頭', () => {
    expect(trend(0)).toEqual({ arrow: '', tone: 'neutral' });
    expect(formatDiff(0)).toBe('0');
  });

  test('Scenario: 結餘合計的標示 → 580 紅色、-200 綠色、沒有箭頭', () => {
    expect(signTone(580)).toBe('up');
    expect(signTone(-200)).toBe('down');
    expect(signTone(0)).toBe('neutral');
  });

  test('Scenario: 百分比無法計算', () => {
    expect(formatPercent(null)).toBe('—');
  });
});
