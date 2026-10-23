import { formatMoney, formatSigned } from '../format.js';

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

function formatTitle(date) {
  const [y, m, d] = date.split('-').map(Number);
  const weekday = WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  return `${m}/${d}（${weekday}）`;
}

// 當日明細：小計＋每一筆紀錄（較晚新增的在前，順序沿用 API）
export default function DayDetail({ date, day }) {
  const income = day?.income ?? 0;
  const expense = day?.expense ?? 0;
  const balance = income - expense;
  const items = day?.items ?? [];

  return (
    <section className="card day-detail" aria-label="當日明細">
      <h2 className="card-title">{formatTitle(date)}</h2>

      <div className="day-totals">
        <span>
          收入 <strong className="income">{formatMoney(income)}</strong>
        </span>
        <span>
          支出 <strong className="expense">{formatMoney(expense)}</strong>
        </span>
        <span>
          結餘 <strong className={balance > 0 ? 'up' : balance < 0 ? 'down' : ''}>{formatMoney(balance)}</strong>
        </span>
      </div>

      {items.length === 0 ? (
        <p className="empty">這天沒有記錄</p>
      ) : (
        <ul className="day-items">
          {items.map((t) => (
            <li key={t.id}>
              <span className="day-item-main">
                <span className="t-category">{t.category}</span>
                {t.note && <span className="t-note">{t.note}</span>}
              </span>
              <span className={`t-amount ${t.type}`}>{formatSigned(t.type, t.amount)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
