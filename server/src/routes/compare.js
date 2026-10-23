import { Router } from 'express';
import { UNITS, isPeriodEnded, periodRange } from '../period.js';
import { taipeiToday } from '../time.js';

// 差額 ÷ 期間一，四捨五入到小數點後一位；期間一為 0 時無法計算（見 design.md 決策 3）
export function percentChange(a, b) {
  if (a === 0) return null;
  return Math.round(((b - a) / a) * 1000) / 10;
}

export function compareRouter(db, { now = () => new Date() } = {}) {
  const router = Router();

  const totalsStmt = db.prepare(
    `SELECT
       COALESCE(SUM(CASE WHEN type = 'income'  THEN amount END), 0) AS income,
       COALESCE(SUM(CASE WHEN type = 'expense' THEN amount END), 0) AS expense
     FROM transactions WHERE date >= ? AND date <= ?`,
  );
  const categoryStmt = db.prepare(
    `SELECT category, SUM(amount) AS amount
     FROM transactions
     WHERE type = 'expense' AND date >= ? AND date <= ?
     GROUP BY category`,
  );

  function periodTotals({ start, end }) {
    const { income, expense } = totalsStmt.get(start, end);
    return { start, end, income, expense, balance: income - expense };
  }

  function categoryTotals({ start, end }) {
    return new Map(categoryStmt.all(start, end).map((r) => [r.category, r.amount]));
  }

  router.get('/', (req, res) => {
    const { unit, a, b } = req.query;
    if (!UNITS.includes(unit)) {
      return res.status(400).json({ error: '比較單位必須是 day、week 或 month' });
    }
    const rangeA = periodRange(unit, a);
    const rangeB = periodRange(unit, b);
    if (!rangeA || !rangeB) {
      return res.status(400).json({ error: '期間格式不正確' });
    }
    const today = taipeiToday(now());
    if (!isPeriodEnded(rangeA, today) || !isPeriodEnded(rangeB, today)) {
      return res.status(400).json({ error: '只能比較已經結束的期間' });
    }

    const totalsA = periodTotals(rangeA);
    const totalsB = periodTotals(rangeB);

    // 兩期的分類合併，缺的補 0，依兩期較大值由大到小排序（見 design.md 決策 4）
    const catA = categoryTotals(rangeA);
    const catB = categoryTotals(rangeB);
    const byCategory = [...new Set([...catA.keys(), ...catB.keys()])]
      .map((category) => {
        const amountA = catA.get(category) ?? 0;
        const amountB = catB.get(category) ?? 0;
        return { category, a: amountA, b: amountB, diff: amountB - amountA };
      })
      .sort((x, y) => Math.max(y.a, y.b) - Math.max(x.a, x.b));

    res.json({
      unit,
      a: totalsA,
      b: totalsB,
      diff: {
        income: { amount: totalsB.income - totalsA.income, percent: percentChange(totalsA.income, totalsB.income) },
        expense: { amount: totalsB.expense - totalsA.expense, percent: percentChange(totalsA.expense, totalsB.expense) },
        balance: { amount: totalsB.balance - totalsA.balance },
      },
      byCategory,
    });
  });

  return router;
}
