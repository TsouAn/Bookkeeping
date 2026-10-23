import { fileURLToPath } from 'node:url';
import { createApp } from './app.js';
import { openDb } from './db.js';

const PORT = Number(process.env.PORT ?? 3001);
const DB_PATH = process.env.DB_PATH ?? fileURLToPath(new URL('../data/expense.db', import.meta.url));

const db = openDb(DB_PATH);
const app = createApp(db);

// 只綁定 127.0.0.1，只有本機連得到（見 design.md Risks）
app.listen(PORT, '127.0.0.1', () => {
  console.log(`記帳本後端：http://localhost:${PORT}`);
  console.log(`資料庫：${DB_PATH}`);
});
