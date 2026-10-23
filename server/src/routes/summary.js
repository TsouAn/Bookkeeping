import { Router } from 'express';
import { isValidMonth } from '../validate.js';
import { monthRange, taipeiMonth } from '../time.js';

export function summaryRouter(db, { now = () => new Date() } = {}) {
  const router = Router();

  router.get('/', (req, res) => {
    const month = req.query.month ?? taipeiMonth(now());
    if (!isValidMonth(month)) {
      return res.status(400).json({ error: '月份格式必須是 YYYY-MM' });
    }
    const [start, end] = monthRange(month);

    const totals = db
      .prepare(
        `SELECT
           COALESCE(SUM(CASE WHEN type = 'income'  THEN amount END), 0) AS income,
           COALESCE(SUM(CASE WHEN type = 'expense' THEN amount END), 0) AS expense
         FROM transactions WHERE date >= ? AND date < ?`,
      )
      .get(start, end);

    const byCategory = db
      .prepare(
        `SELECT category, SUM(amount) AS amount
         FROM transactions
         WHERE type = 'expense' AND date >= ? AND date < ?
         GROUP BY category
         ORDER BY amount DESC`,
      )
      .all(start, end)
      .map((r) => ({ category: r.category, amount: r.amount }));

    res.json({
      month,
      income: totals.income,
      expense: totals.expense,
      balance: totals.income - totals.expense,
      byCategory,
    });
  });

  return router;
}
