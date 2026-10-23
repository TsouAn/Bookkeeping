# Design

## Context

全新專案，目前沒有任何程式碼。動機見 proposal.md 的 Why；行為規格見 `specs/transactions` 與 `specs/monthly-summary`。限制條件：單人自用、在本機執行、之後要能加上需要後端的功能（電子發票載具同步、LINE Bot）。

## Goals / Non-Goals

**Goals:**
- 前後端分離，後端一開始就是唯一資料來源，之後加功能不必搬資料
- 驗證邏輯集中在後端，前端驗證只是為了使用者體驗
- 一個指令同時啟動前後端（`npm run dev`）

**Non-Goals:**
- 不做 production build / 部署設定
- 不做 ORM、migration 工具（只有一張表，用 `CREATE TABLE IF NOT EXISTS`）

## Decisions

### 1. 目錄結構：根目錄用 npm workspaces 管理 `client/` 與 `server/`
```
expense-tracker/
├── package.json          # workspaces + "dev" 同時啟動前後端
├── client/               # React + Vite
│   └── src/
│       ├── App.jsx
│       ├── api.js        # 所有 fetch 呼叫集中在這
│       ├── categories.js # 預設分類（與後端同一份清單）
│       └── components/   # TransactionForm、TransactionList、MonthlySummary、MonthPicker
└── server/               # Express
    ├── src/
    │   ├── app.js        # 建立 express app（不 listen，方便測試）
    │   ├── index.js      # 讀 PORT、listen
    │   ├── db.js         # 開啟 SQLite、建表
    │   ├── validate.js   # 欄位驗證
    │   └── routes/       # transactions.js、summary.js
    └── test/
```
- 替代方案：前後端放同一個 Express 專案、用 Express 提供靜態檔。缺點是開發時沒有 Vite 的熱更新。

### 2. 資料庫：Node 24 內建 `node:sqlite`
- 理由：不需編譯原生模組（`better-sqlite3` 在部分環境要裝 build tools），不用額外裝資料庫伺服器，資料就是一個檔案。
- 替代方案：`better-sqlite3`（較成熟，但要編譯）、PostgreSQL（對個人記帳太重）、JSON 檔（並發寫入與查詢不方便）。
- 資料表：
  ```sql
  CREATE TABLE IF NOT EXISTS transactions (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    type        TEXT    NOT NULL CHECK (type IN ('income','expense')),
    amount      INTEGER NOT NULL CHECK (amount > 0),
    category    TEXT    NOT NULL,
    date        TEXT    NOT NULL,          -- YYYY-MM-DD
    note        TEXT    NOT NULL DEFAULT '',
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
  ```
- 「同日期較晚新增者在前」用 `ORDER BY date DESC, id DESC` 實現。
- 月份篩選用 `date >= 'YYYY-MM-01' AND date < '下個月-01'`，可吃到索引。
- 資料庫路徑由環境變數 `DB_PATH` 決定，預設 `server/data/expense.db`；測試時用 `:memory:`。

### 3. 分類清單：前後端各放一份相同的常數
- 理由：只有 11 個字串且本次不可自訂，共用套件的成本大於好處。後端是驗證的唯一依據。
- 替代方案：`GET /api/categories` 讓前端讀取。等到要做「自訂分類」再改成這樣。

### 4. 「本月」的時區
- 後端用 `Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Taipei' })` 取得台灣當天日期，不依賴伺服器時區。
- 前端預設月份也用同樣方法計算。

### 5. 前端狀態管理：只用 React `useState` + `useEffect`
- 選擇的月份放在 `App`，月份改變或新增/刪除成功後，重新抓列表與統計。
- 替代方案：React Query / Redux。以目前規模是過度設計。

### 6. 開發代理
- Vite `server.proxy` 把 `/api` 轉到 `http://localhost:3001`，前端程式碼只寫相對路徑 `/api/...`，沒有 CORS 問題。

## Risks / Trade-offs

- [`node:sqlite` 在 Node 24 仍標示為 experimental，啟動時可能出現警告] → 資料存取集中在 `db.js`，未來要換 `better-sqlite3` 只改一個檔案。
- [前後端分類清單可能不一致] → 後端測試覆蓋所有分類；之後做自訂分類時改成由 API 提供。
- [沒有登入，任何能連到 3001 port 的人都能讀寫] → 伺服器只綁定 `127.0.0.1`。要部署到外網前必須另開 change 加上驗證。
- [沒有備份] → 資料檔只是一個 `.db` 檔，使用者可以自行複製備份。

## Migration Plan

全新專案，沒有既有資料，不需遷移。
