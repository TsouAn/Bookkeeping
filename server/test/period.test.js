import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { isPeriodEnded, periodRange } from '../src/period.js';

describe('Requirement: 比較單位與期間表示方式', () => {
  test('Scenario: 日期間', () => {
    assert.deepEqual(periodRange('day', '2026-10-15'), { start: '2026-10-15', end: '2026-10-15' });
  });

  test('Scenario: 週期間換算成週一到週日', () => {
    assert.deepEqual(periodRange('week', '2026-10-15'), { start: '2026-10-12', end: '2026-10-18' });
  });

  test('週一與週日本身也屬於同一週', () => {
    assert.deepEqual(periodRange('week', '2026-10-12'), { start: '2026-10-12', end: '2026-10-18' });
    assert.deepEqual(periodRange('week', '2026-10-18'), { start: '2026-10-12', end: '2026-10-18' });
  });

  test('Scenario: 跨月的週', () => {
    assert.deepEqual(periodRange('week', '2026-10-01'), { start: '2026-09-28', end: '2026-10-04' });
  });

  test('跨年的週', () => {
    assert.deepEqual(periodRange('week', '2027-01-01'), { start: '2026-12-28', end: '2027-01-03' });
  });

  test('Scenario: 月期間', () => {
    assert.deepEqual(periodRange('month', '2026-02'), { start: '2026-02-01', end: '2026-02-28' });
    assert.deepEqual(periodRange('month', '2028-02'), { start: '2028-02-01', end: '2028-02-29' });
    assert.deepEqual(periodRange('month', '2026-12'), { start: '2026-12-01', end: '2026-12-31' });
  });

  test('格式不符合單位時回傳 null', () => {
    assert.equal(periodRange('month', '2026-10-15'), null);
    assert.equal(periodRange('day', '2026-10'), null);
    assert.equal(periodRange('week', undefined), null);
    assert.equal(periodRange('year', '2026'), null);
  });
});

describe('Requirement: 只能比較已結束的期間', () => {
  test('Scenario: 昨天可以比較', () => {
    assert.equal(isPeriodEnded(periodRange('day', '2026-10-19'), '2026-10-20'), true);
  });

  test('Scenario: 今天不能比較', () => {
    assert.equal(isPeriodEnded(periodRange('day', '2026-10-20'), '2026-10-20'), false);
  });

  test('Scenario: 本週不能比較', () => {
    assert.equal(isPeriodEnded(periodRange('week', '2026-10-19'), '2026-10-20'), false);
  });

  test('Scenario: 上週日結束後即可比較', () => {
    assert.equal(isPeriodEnded(periodRange('week', '2026-10-12'), '2026-10-19'), true);
  });

  test('Scenario: 本月不能比較', () => {
    assert.equal(isPeriodEnded(periodRange('month', '2026-10'), '2026-10-20'), false);
    assert.equal(isPeriodEnded(periodRange('month', '2026-09'), '2026-10-01'), true);
  });
});
