import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS transactions (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    type        TEXT    NOT NULL CHECK (type IN ('income','expense')),
    amount      INTEGER NOT NULL CHECK (amount > 0),
    category    TEXT    NOT NULL,
    date        TEXT    NOT NULL,
    note        TEXT    NOT NULL DEFAULT '',
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
`;

// 開啟資料庫並確保資料表存在。path 為 ':memory:' 時資料只存在記憶體（測試用）
export function openDb(path) {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec(SCHEMA);
  return db;
}
