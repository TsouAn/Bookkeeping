# Design

## Context

動機見 proposal.md；行為見 `specs/period-comparison`。現有後端已有依月份統計的 SQL（`server/src/routes/summary.js`）與台灣時間工具（`server/src/time.js`），前端只有單一頁面（`App.jsx`），狀態只用 `useState`。資料表 `transactions` 的 `date` 欄位有索引，以 `YYYY-MM-DD` 文字儲存。

## Goals / Non-Goals

**Goals:**
- 一支 API 一次回傳兩期資料與差額，前端不必自己算差額
- 「期間 → 起訖日期」與「是否已結束」的規則在後端定義並以後端為準；前端用相同規則只為了讓按鈕不能點
- 不新增套件、不改資料表

**Non-Goals:**
- 不重構現有 `/api/summary`（避免影響已 archive 的 `monthly-summary` 行為）
- 不加前端路由套件（兩個頁籤用一個 state 切換即可）

## Decisions

### 1. API 形狀：單一端點 `GET /api/compare?unit=&a=&b=`
回應：
```json
{
  "unit": "week",
  "a": { "start": "2026-10-05", "end": "2026-10-11", "income": 0, "expense": 2800, "balance": -2800 },
  "b": { "start": "2026-10-12", "end": "2026-10-18", "income": 0, "expense": 3200, "balance": -3200 },
  "diff": {
    "income":  { "amount": 0,    "percent": null },
    "expense": { "amount": 400,  "percent": 14.3 },
    "balance": { "amount": -400 }
  },
  "byCategory": [{ "category": "餐飲", "a": 1200, "b": 1500, "diff": 300 }]
}
```
- 替代方案：前端呼叫兩次「任意區間的 summary」再自己算差額。缺點是差額、百分比、分類合併的規則會散在前端，難以用後端測試覆蓋 spec。

### 2. 期間計算集中在 `server/src/period.js`
- `periodRange(unit, value)` → `{ start, end }` 或 `null`（格式錯誤）
  - day：`start = end = value`
  - week：用 UTC 日期運算算出星期幾（`getUTCDay()`，週日為 0），往回推到週一，`end = start + 6 天`。全程用 UTC 避免伺服器時區造成日期偏移
  - month：`start = YYYY-MM-01`，`end = 當月最後一天`
- 「已結束」判斷：`end < taipeiToday()`（字串比較即可，因為格式固定為 `YYYY-MM-DD`）
- 查詢用 `date >= start AND date <= end`，可用到既有的日期索引
- 替代方案：用 ISO 週字串 `2026-W42`。缺點是原生日期選擇器無法直接產生，且跨年週號規則不直覺。

### 3. 百分比計算
- `percent = round(diff / a * 100, 1)`，`a === 0` 時為 `null`
- 用 `Math.round(x * 10) / 10`；負數的 .x5 進位方向與正數略有差異，對記帳用途可接受
- 結餘可能為負或 0，百分比沒有意義，所以不提供

### 4. 分類比較在 SQL 分別取兩期小計，在 JS 合併
- 兩次 `GROUP BY category` 查詢後用 `Map` 合併，缺的補 0，依 `max(a, b)` 由大到小排序
- 替代方案：一條 SQL 用 `CASE WHEN` 同時算兩期。可行但較難讀，資料量小時沒有效能差異。

### 5. 前端結構
```
client/src/
├── App.jsx                 加入 tab state：'ledger' | 'compare'
├── period.js               與後端相同的期間規則（預設期間、上一期／下一期、是否已結束、顯示文字）
└── components/
    ├── Tabs.jsx            「記帳 / 比較」頁籤
    ├── ComparePage.jsx     單位切換 + 兩個期間選擇器 + 結果
    ├── PeriodPicker.jsx    ‹ 期間文字 › 步進按鈕；日、週另有原生日期選擇器可快速跳轉（max = 最後一個已結束期間的日期）
    ├── CompareTable.jsx    收入／支出／結餘表格與 ↑↓ 標示
    └── CategoryCompareChart.jsx  分類並排長條圖（純 CSS）
```
- 記帳頁的月份 state 維持放在 `App`，切頁籤不會遺失（滿足「切換頁籤保留記帳頁狀態」）
- 月份不使用 `<input type="month">`：Safari 桌面版不支援，只用 ‹ › 步進
- 期間一、期間二的顏色使用兩個固定 CSS 變數（淺色／深色模式各一組），圖例與長條共用

### 6. ↑↓ 顏色規則放在前端一個純函式
- `trend(kind, amount)` → `{ arrow: '↑' | '↓' | '', tone: 'good' | 'bad' | 'neutral' }`
- 支出增加 = bad（紅）、收入增加 = good（綠）、結餘增加 = good；差額 0 為 neutral 且不顯示箭頭
- 以 Vitest 測試這個函式，覆蓋 spec 中的顏色 scenario

## Risks / Trade-offs

- [前後端各有一份期間規則，可能不一致] → 後端是唯一驗證依據，前端只影響按鈕可否點選；兩邊都用同一組 scenario 日期測試
- [`Math.round` 對負數 .5 的進位方向與一般認知不同（-14.25 → -14.2）] → 對記帳用途影響極小，記錄在此，不另外處理
- [長條圖純 CSS，分類多時畫面變長] → 分類最多 7 個（固定清單），可接受
- [比較頁每次變更期間都打一次 API] → 單機、資料量小，不做快取

## Migration Plan

不改資料表、不改既有 API，無需遷移。
