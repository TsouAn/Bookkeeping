import { Router } from 'express';
import { isValidMonth, validateTransaction } from '../validate.js';
import { monthRange } from '../time.js';

const COLUMNS = 'id, type, amount, category, date, note, created_at AS createdAt';

export function transactionsRouter(db) {
  const router = Router();

  router.get('/', (req, res) => {
    const { month } = req.query;
    if (month === undefined) {
      const rows = db.prepare(`SELECT ${COLUMNS} FROM transactions ORDER BY date DESC, id DESC`).all();
      return res.json(rows);
    }
    if (!isValidMonth(month)) {
      return res.status(400).json({ error: '月份格式必須是 YYYY-MM' });
    }
    const [start, end] = monthRange(month);
    const rows = db
      .prepare(
        `SELECT ${COLUMNS} FROM transactions
         WHERE date >= ? AND date < ?
         ORDER BY date DESC, id DESC`,
      )
      .all(start, end);
    res.json(rows);
  });

  router.post('/', (req, res) => {
    const { error, value } = validateTransaction(req.body);
    if (error) return res.status(400).json({ error });

    const { lastInsertRowid } = db
      .prepare('INSERT INTO transactions (type, amount, category, date, note) VALUES (?, ?, ?, ?, ?)')
      .run(value.type, value.amount, value.category, value.date, value.note);
    const row = db.prepare(`SELECT ${COLUMNS} FROM transactions WHERE id = ?`).get(lastInsertRowid);
    res.status(201).json(row);
  });

  router.delete('/:id', (req, res) => {
    const id = Number(req.params.id);
    const { changes } = Number.isInteger(id)
      ? db.prepare('DELETE FROM transactions WHERE id = ?').run(id)
      : { changes: 0 };
    if (changes === 0) return res.status(404).json({ error: '找不到此筆記錄' });
    res.status(204).end();
  });

  return router;
}
