import { formatMoney } from '../format.js';
import { formatDiff, trend } from '../trend.js';

// 各分類兩期支出的並排長條圖，純 CSS（見 design.md 決策 5）
export default function CategoryCompareChart({ byCategory }) {
  const max = Math.max(0, ...byCategory.flatMap((c) => [c.a, c.b]));

  return (
    <section className="card">
      <div className="chart-header">
        <h2 className="card-title">分類支出比較</h2>
        <ul className="legend" aria-label="圖例">
          <li>
            <span className="swatch series-a" aria-hidden="true" />
            期間一
          </li>
          <li>
            <span className="swatch series-b" aria-hidden="true" />
            期間二
          </li>
        </ul>
      </div>

      {byCategory.length === 0 ? (
        <p className="empty">這兩個期間都沒有支出</p>
      ) : (
        <ul className="compare-chart">
          {byCategory.map(({ category, a, b, diff }) => (
            <li key={category} className="compare-row">
              <div className="compare-row-head">
                <span className="compare-category">{category}</span>
                <span className={`diff ${trend('expense', diff).tone}`}>{formatDiff(diff)}</span>
              </div>
              {[
                ['series-a', '期間一', a],
                ['series-b', '期間二', b],
              ].map(([series, label, amount]) => (
                <div key={series} className="bar-row" title={`${category}・${label}：${formatMoney(amount)}`}>
                  <span className="bar-track compare-track">
                    <span className={`bar-fill ${series}`} style={{ width: `${max ? (amount / max) * 100 : 0}%` }} />
                  </span>
                  <span className="bar-value">{formatMoney(amount)}</span>
                </div>
              ))}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
