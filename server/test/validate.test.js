import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { validateTransaction } from '../src/validate.js';
import { CATEGORIES } from '../src/categories.js';
import { expense, income } from './helpers.js';

const errorOf = (input) => validateTransaction(input).error;

describe('Requirement: 金額驗證', () => {
  test('Scenario: 金額為 0 或負數', () => {
    assert.equal(errorOf(expense({ amount: 0 })), '金額必須是大於 0 的整數');
    assert.equal(errorOf(expense({ amount: -50 })), '金額必須是大於 0 的整數');
  });

  test('Scenario: 金額含小數', () => {
    assert.equal(errorOf(expense({ amount: 99.5 })), '金額必須是大於 0 的整數');
  });

  test('金額是字串也拒絕', () => {
    assert.equal(errorOf(expense({ amount: '120' })), '金額必須是大於 0 的整數');
  });

  test('Scenario: 金額超過上限', () => {
    assert.equal(errorOf(expense({ amount: 10_000_001 })), '金額不可超過 10,000,000');
    assert.equal(errorOf(expense({ amount: 10_000_000 })), undefined);
  });
});

describe('Requirement: 類型與分類驗證', () => {
  test('Scenario: 類型不合法', () => {
    assert.equal(errorOf(expense({ type: 'transfer' })), '類型必須是 income 或 expense');
  });

  test('Scenario: 分類與類型不符', () => {
    assert.equal(errorOf(income({ category: '餐飲' })), '分類不屬於此類型');
  });

  test('所有預設分類都可通過', () => {
    for (const [type, list] of Object.entries(CATEGORIES)) {
      for (const category of list) {
        assert.equal(errorOf(expense({ type, category })), undefined, `${type}/${category}`);
      }
    }
  });
});

describe('Requirement: 日期與備註驗證', () => {
  test('Scenario: 日期格式錯誤或不存在', () => {
    assert.equal(errorOf(expense({ date: '2026/10/20' })), '日期格式必須是 YYYY-MM-DD');
    assert.equal(errorOf(expense({ date: '2026-02-30' })), '日期格式必須是 YYYY-MM-DD');
  });

  test('閏年 2/29 合法', () => {
    assert.equal(errorOf(expense({ date: '2028-02-29' })), undefined);
  });

  test('Scenario: 備註過長', () => {
    assert.equal(errorOf(expense({ note: '字'.repeat(101) })), '備註不可超過 100 字');
    assert.equal(errorOf(expense({ note: '字'.repeat(100) })), undefined);
  });

  test('備註未填時為空字串', () => {
    assert.equal(validateTransaction(income()).value.note, '');
  });
});
