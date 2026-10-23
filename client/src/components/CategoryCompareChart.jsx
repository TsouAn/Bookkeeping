import { formatMoney } from '../format.js';
import { formatDiff, trend } from '../trend.js';

// 各分類兩期支出的並排長條圖，純 CSS（見 design.md 決策 5）。外框卡片與圖例由 ComparePage 提供
export default function CategoryCompareChart({ byCategory }) {
  if (byCategory.length === 0) {
    return <p className="empty">這兩個期間都沒有支出</p>;
  }

  const max = Math.max(0, ...byCategory.flatMap((c) => [c.a, c.b]));

  return (
    <ul className="compare-chart">
      {byCategory.map(({ category, a, b, diff }) => (
        <li key={category} className="compare-row">
          <span className="compare-category">{category}</span>
          <span className={`compare-diff diff ${trend(diff).tone}`}>{formatDiff(diff)}</span>
          {[
            ['series-a', '期間一', a],
            ['series-b', '期間二', b],
          ].map(([series, label, amount], i) => (
            <span
              key={series}
              className="bar-row"
              style={{ gridRow: i + 1 }}
              title={`${category}・${label}：${formatMoney(amount)}`}
            >
              <span className="compare-track">
                <span className={`bar-fill ${series}`} style={{ width: `${max ? (amount / max) * 100 : 0}%` }} />
              </span>
              <span className="bar-value">{formatMoney(amount)}</span>
            </span>
          ))}
        </li>
      ))}
    </ul>
  );
}
