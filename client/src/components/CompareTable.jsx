import { formatMoney } from '../format.js';
import { formatDiff, formatPercent, trend } from '../trend.js';

const ROWS = [
  ['income', '收入'],
  ['expense', '支出'],
  ['balance', '結餘'],
];

export default function CompareTable({ result }) {
  const { a, b, diff } = result;

  return (
    <section className="card">
      <h2 className="card-title">總額比較</h2>
      <table className="compare-table">
        <thead>
          <tr>
            <th scope="col" />
            <th scope="col">
              <span className="swatch series-a" aria-hidden="true" />
              期間一
            </th>
            <th scope="col">
              <span className="swatch series-b" aria-hidden="true" />
              期間二
            </th>
            <th scope="col">差額</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map(([kind, label]) => {
            const { amount, percent } = diff[kind];
            const { tone } = trend(kind, amount);
            return (
              <tr key={kind}>
                <th scope="row">{label}</th>
                <td>{formatMoney(a[kind])}</td>
                <td>{formatMoney(b[kind])}</td>
                <td className={`diff ${tone}`}>
                  {formatDiff(amount)}
                  {/* 結餘沒有百分比（spec: 總額比較） */}
                  {kind !== 'balance' && <span className="percent">（{formatPercent(percent)}）</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
