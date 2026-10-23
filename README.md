# 記帳本

個人記帳 Web App：記錄收入與支出、查看每月統計、比較兩個期間的收支。

## 功能

- **記帳**：新增收入／支出、依月份查看明細與統計、刪除記錄
- **日曆**：月曆顯示每天的支出（綠 −）與收入（紅 +），點某一天查看當日小計與每一筆紀錄
  - 週一開頭；預設本月並選取今天；金額 ≥ 10,000 在格子內以「萬」縮寫
- **比較**：選擇單位（日／週／月），挑兩個期間並排比較
  - 週為週一到週日；只能比較已經結束的期間（今天、本週、本月不能選）
  - 顯示收入、支出的差額與變化百分比、結餘的兩期合計，以及各分類支出的並排長條圖
  - 紅漲綠跌：增加一律紅色 ↑、減少一律綠色 ↓

- 前端：React + Vite（`client/`）
- 後端：Express + SQLite（`server/`，使用 Node 內建 `node:sqlite`）
- 規格：OpenSpec（`openspec/`）

## 需求

- Node.js 24 以上

## 安裝

```bash
npm install
```

## 啟動（開發模式）

```bash
npm run dev
```

打開 http://localhost:5173 。

- 前端在 5173，後端在 3001，前端的 `/api` 會自動轉給後端
- 記帳資料存在 `server/data/expense.db`，複製這個檔案就是備份
- 後端只接受本機連線（127.0.0.1）

可用環境變數：

| 變數 | 預設值 | 說明 |
|---|---|---|
| `PORT` | `3001` | 後端 port |
| `DB_PATH` | `server/data/expense.db` | 資料庫檔案位置 |

## 測試

```bash
npm test
```

- 後端：`node:test` + `supertest`（`server/test/`），每個 spec Scenario 都有對應測試
- 前端：Vitest（`client/test/`）

## 開發流程（OpenSpec）

新功能先寫規格再寫程式：

1. `/opsx:propose <想做的功能>`：產生 proposal、specs、design、tasks
2. 審核、修改規格
3. `/opsx:apply`：照 tasks.md 實作
4. `/opsx:archive`：把規格合併進 `openspec/specs/`

目前的系統規格在 `openspec/specs/`，進行中的變更在 `openspec/changes/`。
