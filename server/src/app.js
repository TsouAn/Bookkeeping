import express from 'express';
import { transactionsRouter } from './routes/transactions.js';
import { summaryRouter } from './routes/summary.js';
import { compareRouter } from './routes/compare.js';

// 建立 app 但不 listen，測試可以直接拿來用（見 design.md 決策 1）
export function createApp(db, options = {}) {
  const app = express();
  app.use(express.json());

  app.get('/api/health', (req, res) => res.json({ ok: true }));
  app.use('/api/transactions', transactionsRouter(db));
  app.use('/api/summary', summaryRouter(db, options));
  app.use('/api/compare', compareRouter(db, options));

  // JSON 格式錯誤等未預期的錯誤，統一回 { error }
  app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') {
      return res.status(400).json({ error: '請求內容不是合法的 JSON' });
    }
    console.error(err);
    res.status(500).json({ error: '伺服器發生錯誤' });
  });

  return app;
}
