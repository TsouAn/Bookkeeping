# Design

## Context

動機見 proposal.md；行為見 `specs/app-navigation`（頁籤只限手機、新增電腦版選單）與 `specs/ledger-page`。目前 `App.jsx` 以 `Tabs` 切換三頁，記帳頁為單欄：統計卡片（含月份選擇）＋一張合併「新增表單＋明細」的卡片，`.app` 最大寬度 560px。新增成功後 `handleCreate` 會重新抓資料或切換月份，但不知道新紀錄的 `id`。

## Goals / Non-Goals

**Goals:**
- 手機版畫面與現在完全相同（只在 ≥ 900px 生效）
- 版面切換純用 CSS media query，不在 JS 判斷螢幕寬度
- 不新增套件、不改後端

**Non-Goals:**
- 不做選單內的管理功能
- 不做路由（網址不隨頁面改變）

## Decisions

### 1. 斷點 900px，全部用 CSS 切換
- `Tabs` 與 ☰ 按鈕兩者都渲染，以 `@media (min-width: 900px)` 決定誰顯示；選單本身只在打開時渲染
- 替代方案：用 `window.matchMedia` 在 JS 判斷並只渲染其一。需要監聽 resize、測試較麻煩，且 CSS 已足以表達

### 2. 記帳頁 DOM 結構：三個區塊，兩種排列
```
<div class="ledger-layout">
  <div class="ledger-left">
    <MonthlySummary>（含 MonthPicker）
    <section class="card ledger-form-card"> <TransactionForm/>
  </div>
  <section class="card ledger-list-card"> <TransactionList/>
</div>
```
- 電腦：`grid-template-columns: 420px 1fr`；右欄 `position: sticky; top: 16px; max-height: calc(100vh - 32px); overflow-y: auto`
- 手機：單欄，表單卡與明細卡之間間距 0、相鄰邊框與圓角去掉，視覺上維持「同一張卡片＋分隔線」，與目前畫面一致
- 替代方案：手機與電腦各寫一份 JSX。重複且容易不同步

### 3. 電腦版容器寬度
- `.app` 在 ≥ 900px 時 `max-width: 1080px`；日曆、比較頁的 `main` 另外限制 `max-width: 720px` 並置中，維持單欄閱讀寬度

### 4. ☰ 選單：`NavDrawer` 元件
- props：`items`（沿用 `TABS`）、`active`、`onSelect`、`onClose`
- 結構：遮罩 `<div class="drawer-backdrop">` ＋ `<nav class="drawer" aria-label="頁面選單">`；項目為 `<button aria-current="page">`
- 打開時監聽 `keydown` 的 Escape；打開後焦點移到第一個項目，關閉後焦點回到 ☰ 按鈕
- 滑出動畫用 CSS `transform: translateX(-100%) → 0`，並尊重 `prefers-reduced-motion`
- 標題列：`<h1>記帳本<span class="page-name">・日曆</span></h1>`，`page-name` 只在電腦版顯示

### 5. 新紀錄標示
- `handleCreate` 取用 `api.create` 回傳的紀錄 `id`，存成 `highlightId`；`TransactionList` 收到後對該列加上 `is-new` class
- `is-new` 用 CSS 動畫：背景 `--accent` 的淡色 → 透明，2 秒，結束後由 `onAnimationEnd` 或 2 秒計時清除 `highlightId`
- 新紀錄在其他月份：沿用現有「切換到該月份」，`highlightId` 不清除，切月後抓到資料即標示

## Risks / Trade-offs

- [手機版用「去掉相鄰邊框」模擬單一卡片，若之後改卡片樣式可能露出接縫] → 樣式集中在 `.ledger-layout` 區塊並加註解
- [右欄 sticky 依賴 `100vh`，部分手機瀏覽器網址列會影響高度] → 只在 ≥ 900px 使用，電腦瀏覽器無此問題
- [兩種導覽同時存在 DOM] → 以 CSS 隱藏的那一個不可聚焦（`display: none`），不影響鍵盤操作

## Migration Plan

純前端版面調整，不改 API 與資料，無需遷移。
