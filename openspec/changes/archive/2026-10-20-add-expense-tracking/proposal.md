# Proposal

## Why

我想要一個自己能掌控資料的記帳工具，記錄每天的收入與支出，並隨時知道「這個月花了多少、各分類花在哪」。這是整個記帳 App 的第一步，之後的 LINE Pay 解析與電子發票載具同步都會建立在這裡的資料模型與 API 之上。

## What Changes

- 建立專案骨架：`client/`（React + Vite）與 `server/`（Express + SQLite）
- 新增「收支記錄」：可新增一筆收入或支出（類型、金額、分類、日期、備註）
- 新增「收支列表」：依日期新到舊列出記錄，可刪除單筆
- 新增「本月統計」：顯示本月總收入、總支出、結餘，以及支出各分類小計
- 提供預設分類（固定清單，不可自訂）
  - 支出：餐飲、交通、購物、娛樂、居家、醫療、其他
  - 收入：薪資、獎金、投資、其他

### Non-goals（本次不做）

- 編輯既有記錄（先刪除再新增）
- 自訂分類
- 使用者登入、多人使用
- LINE Pay 付款通知解析（後續 change：`add-linepay-paste-import`）
- 電子發票手機條碼載具同步（後續 change：`add-einvoice-carrier-sync`）
- 匯出、圖表、預算提醒
- 部署到雲端（本次只在本機執行）

## Capabilities

### New Capabilities
- `transactions`: 收支記錄的新增、列出、刪除，以及欄位驗證規則與預設分類
- `monthly-summary`: 依指定月份計算總收入、總支出、結餘與支出分類小計

### Modified Capabilities
（無，這是第一個 change）

## Impact

- 新增程式碼：`client/`、`server/`、根目錄 `package.json`（同時啟動前後端的 scripts）
- 新增 API：`GET/POST /api/transactions`、`DELETE /api/transactions/:id`、`GET /api/summary`
- 新增相依套件：`react`、`react-dom`、`vite`、`@vitejs/plugin-react`、`express`、`supertest`、`vitest`、`concurrently`（根目錄 `npm run dev` 同時啟動前後端）
- 新增資料檔：`server/data/expense.db`（加入 `.gitignore`）
