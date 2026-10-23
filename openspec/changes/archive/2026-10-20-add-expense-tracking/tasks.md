# Tasks

## 1. 專案骨架

- [x] 1.1 建立根目錄 `package.json`（npm workspaces：`client`、`server`）與 `.gitignore`（含 `node_modules`、`server/data/`），驗證：`npm install` 成功
- [x] 1.2 建立 `server/`：安裝 `express`、`supertest`，建立 `src/app.js`（含 `GET /api/health` 回 `{ ok: true }`）與 `src/index.js`（綁定 `127.0.0.1:3001`），驗證：`npm run dev -w server` 後 `curl localhost:3001/api/health` 回 `{"ok":true}`
- [x] 1.3 建立 `client/`：React + Vite，設定 `/api` proxy 到 3001，驗證：瀏覽器打開 Vite 網址能看到標題「記帳本」
- [x] 1.4 根目錄 `npm run dev` 同時啟動前後端，驗證：一個指令後兩個服務都可連線

## 2. 後端：資料庫與驗證

- [x] 2.1 實作 `server/src/db.js`：依 `DB_PATH` 開啟 `node:sqlite`、建立 `transactions` 表與索引，驗證：測試以 `:memory:` 開啟後可查到資料表
- [x] 2.2 實作 `server/src/categories.js` 與 `server/src/validate.js`（金額、類型、分類、日期、備註規則），驗證：`node --test` 涵蓋 spec 中所有驗證 scenario（0、負數、小數、超過上限、`transfer`、分類不符、`2026/10/20`、`2026-02-30`、101 字備註）並全部通過

## 3. 後端：收支 API

- [x] 3.1 實作 `POST /api/transactions`，驗證：測試涵蓋「新增支出成功」「新增收入成功（備註為空字串）」與驗證失敗回 `400` + 正確錯誤訊息
- [x] 3.2 實作 `GET /api/transactions?month=YYYY-MM`（`ORDER BY date DESC, id DESC`），驗證：測試涵蓋「新到舊排序」「依月份篩選」「沒有記錄回空陣列」「新增後立即可在列表看到」
- [x] 3.3 實作 `DELETE /api/transactions/:id`，驗證：測試涵蓋「刪除成功回 204 且列表不再出現」「不存在回 404 + 找不到此筆記錄」
- [x] 3.4 驗證資料持久保存：測試用暫存檔案路徑建立 app、新增一筆、關閉後重新開啟，列表仍包含該筆

## 4. 後端：月份統計 API

- [x] 4.1 實作台灣時間「今天 / 本月」工具函式，驗證：測試給定 UTC `2026-10-31T17:00Z` 回傳 `2026-11`
- [x] 4.2 實作 `GET /api/summary?month=YYYY-MM`（總收入、總支出、結餘、支出分類小計由大到小），驗證：測試涵蓋 monthly-summary spec 的所有 API scenario（含結餘為負、空月份、跨月邊界、月份格式錯誤 400、收入不列入分類小計）

## 5. 前端：畫面

- [x] 5.1 實作 `client/src/api.js`（list / create / remove / summary，非 2xx 時丟出含後端 `error` 訊息的錯誤），驗證：Vitest 以 mock fetch 測試錯誤訊息傳遞
- [x] 5.2 實作 `MonthPicker`（預設台灣時間當月，可切換上一月 / 下一月），驗證：畫面顯示當月，按鈕切換月份正確
- [x] 5.3 實作 `TransactionForm`（類型切換時分類選單跟著換、日期預設今天、送出失敗顯示後端錯誤訊息），驗證：新增一筆支出後表單清空、列表出現該筆；輸入金額 0 時顯示「金額必須是大於 0 的整數」
- [x] 5.4 實作 `TransactionList`（日期、分類、備註、金額；收入綠色 +、支出紅色 −；刪除前 `confirm`），驗證：取消確認時記錄保留、確認後記錄消失
- [x] 5.5 實作 `MonthlySummary`（總收入、總支出、結餘、分類小計長條），驗證：新增 / 刪除 / 切換月份後數字立即更新
- [x] 5.6 撰寫 `client/src/App.css` 基本版面（手機寬度可用、金額千分位），驗證：瀏覽器寬度 375px 時無水平捲軸

## 6. 整合驗證

- [x] 6.1 端對端手動驗證：`npm run dev`，依序新增收入 50000、支出 120 與 380，確認統計為 50000 / 500 / 49500；刪除 380 後統計更新為 50000 / 120 / 49880；重啟伺服器後資料仍在
- [x] 6.2 撰寫根目錄 `README.md`（安裝、啟動、測試指令），驗證：照 README 從乾淨 clone 能跑起來
- [x] 6.3 執行 `openspec validate add-expense-tracking --strict` 通過

## Workflow follow-up

- 執行 `/opsx:verify`（或請 AI 對照 specs 檢查實作）
- 全部測試通過後執行 `/opsx:archive`，把 specs 合併進 `openspec/specs/`
