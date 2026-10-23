import { formatMoney } from '../format.js';

export default function MonthlySummary({ summary }) {
  if (!summary) return null;

  const { income, expense, balance, byCategory } = summary;
  const max = byCategory[0]?.amount ?? 0;

  return (
    <section className="card summary" aria-label="本月統計">
      <div className="stats">
        <div className="stat">
          <span className="stat-label">收入</span>
          <span className="stat-value income">{formatMoney(income)}</span>
        </div>
        <div className="stat">
          <span className="stat-label">支出</span>
          <span className="stat-value expense">{formatMoney(expense)}</span>
        </div>
        <div className="stat">
          <span className="stat-label">結餘</span>
          <span className={`stat-value ${balance > 0 ? 'up' : balance < 0 ? 'down' : ''}`}>{formatMoney(balance)}</span>
        </div>
      </div>

      {byCategory.length > 0 && (
        <ul className="category-bars">
          {byCategory.map(({ category, amount }) => (
            <li key={category}>
              <span className="bar-label">{category}</span>
              <span className="bar-track">
                <span className="bar-fill" style={{ width: `${(amount / max) * 100}%` }} />
              </span>
              <span className="bar-value">{formatMoney(amount)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
