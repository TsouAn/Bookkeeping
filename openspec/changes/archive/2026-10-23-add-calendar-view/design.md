# Design

## Context

動機見 proposal.md；行為見 `specs/calendar-view` 與 `specs/period-comparison`（頁籤數量的修改）。現有 `GET /api/transactions?month=YYYY-MM` 已能回傳整月紀錄（日期新到舊、同日較晚新增在前）。前端已有台灣時間工具（`client/src/time.js`）、期間工具（`client/src/period.js`，含週一計算）與金額格式（`format.js`），配色已有 `--up`（紅）、`--down`（綠）。

## Goals / Non-Goals

**Goals:**
- 不動後端：月曆所需的每日合計與當日明細都能由整月資料在前端算出
- 每日彙總寫成純函式，以 Vitest 覆蓋 spec scenario
- 375px 手機寬度下 7 欄月曆仍可讀、無水平捲軸

**Non-Goals:**
- 不做新的 API、不改資料表
- 不引入日曆套件

## Decisions

### 1. 資料：沿用 `api.list(month)`，前端彙總
- 切到日曆頁或切換月份時呼叫一次 `api.list(month)`，用 `summarizeByDay(transactions)` 算出 `Map<date, { income, expense, items }>`
- `items` 保持 API 的順序（同日較晚新增在前），直接滿足「較晚新增的在前」
- 替代方案：新增 `GET /api/calendar?month=` 由後端彙總。個人記帳一個月頂多幾百筆，前端彙總沒有效能問題，且不必新增 API 與測試；等資料量變大或要給其他用戶端使用時再搬到後端

### 2. 月曆格子：`buildMonthGrid(month)` 純函式
- 回傳長度為 7 的倍數的陣列，元素為 `'YYYY-MM-DD'` 或 `null`（留空）
- 前置空格數 = 該月 1 號的 `(getUTCDay() + 6) % 7`（週一為 0），與 `period.js` 的週一規則相同
- 全部用 UTC 日期運算，避免使用者電腦時區影響

### 3. 狀態放在 `CalendarPage` 內部
- `month`、`selectedDate`、`transactions` 由 `CalendarPage` 自己管理；每次掛載（切到頁籤）都重新抓資料，自然滿足「日曆資料保持最新」
- 切換月份：本月 → 選今天；其他月份 → 選 1 號
- 替代方案：把日曆狀態放在 `App` 以保留切頁籤前的位置。spec 要求每次進入都顯示本月今天，因此不需要

### 4. 元件
```
client/src/
├── calendar.js                 buildMonthGrid、summarizeByDay（純函式）
└── components/
    ├── CalendarPage.jsx        月份切換（重用 MonthPicker）＋月曆＋當日明細
    ├── MonthCalendar.jsx       7 欄格子、星期標題、今天外框、選取狀態
    └── DayDetail.jsx           標題、當日小計、紀錄列表、空狀態
```
- 月份切換重用現有 `MonthPicker`（已有 ‹ ›、「回本月」）
- 格子是 `<button>`，可用鍵盤操作；`aria-label` 寫出「10月22日 支出 70 收入 1,000」，螢幕閱讀器不必靠顏色辨識

### 5. 手機版面
- 格子最小高度 52px，金額字級 0.65rem、`tabular-nums`
- 金額 ≥ 10,000 時改用「萬」縮寫，四捨五入到小數一位（例：12,345 → 1.2萬、123,456 → 12.3萬；百萬以上不留小數，1,234,567 → 123萬），避免撐破格子；當日明細仍顯示完整金額
  - 原訂門檻 100,000，實測 375px 寬度下「−99,999」會被截斷 1px，因此降到 10,000，格子內最長為「−9,999」

### 6. 頁籤規格獨立成 `app-navigation`
- 頁籤原本寫在 `period-comparison` 的「比較畫面」需求裡，每加一個頁籤就得改比較功能的規格，功能之間互相牽動、日後也不好查
- 本次新增 `app-navigation` 規格專管頁籤；`period-comparison` 以 REMOVED 移除「比較畫面」、以 ADDED 新增「比較頁期間選擇」，只保留比較頁自身行為
- 不用 MODIFIED 的原因：MODIFIED 會整條替換且不允許少掉既有 scenario（OpenSpec 會擋），而這裡是把一個 scenario 搬到另一份規格；用 REMOVED 並寫明 Migration，查歷史的人才知道規則搬去哪裡
- 程式：`App.jsx` 的 `TABS` 改為 `記帳／日曆／比較`，日曆頁與比較頁一樣只在選中時渲染

### 7. 檔案分開，方便分別提交
- 日曆的樣式放在 `components/Calendar.css`，由 `CalendarPage.jsx` 匯入，不修改 `App.css`
- 日曆只新增檔案，唯一修改的既有檔案是 `App.jsx`（加頁籤），讓 git 提交可以依功能分開

## Risks / Trade-offs

- [前端彙總與後端統計可能出現不一致] → 兩者都只做加總，規則簡單；日曆不重新定義「月」，直接用 API 回傳的資料
- [格子空間小，大金額可能擠壓] → 以「萬」縮寫，明細區顯示完整數字
- [每次切頁籤都重新抓資料] → 單機、單月資料量小，換取資料一定是最新的

## Migration Plan

純前端新增，不改 API 與資料表，無需遷移。
