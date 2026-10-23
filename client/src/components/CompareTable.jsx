import { formatMoney } from '../format.js';
import { formatDiff, formatPercent, signTone, trend } from '../trend.js';

const ROWS = [
  ['income', '收入'],
  ['expense', '支出'],
];

// 收入／支出／結餘的兩期金額與差額。外框卡片由 ComparePage 提供
export default function CompareTable({ result }) {
  const { a, b, diff, combinedBalance } = result;

  return (
    <table className="compare-table">
      <thead>
        <tr>
          <th scope="col">
            <span className="visually-hidden">項目</span>
          </th>
          <th scope="col">期間一</th>
          <th scope="col">期間二</th>
          <th scope="col">差額</th>
        </tr>
      </thead>
      <tbody>
        {ROWS.map(([kind, label]) => {
          const { amount, percent } = diff[kind];
          const { tone } = trend(amount);
          return (
            <tr key={kind}>
              <th scope="row">{label}</th>
              <td>{formatMoney(a[kind])}</td>
              <td>{formatMoney(b[kind])}</td>
              <td className={`diff ${tone}`}>
                {formatDiff(amount)}
                <span className="percent">（{formatPercent(percent)}）</span>
              </td>
            </tr>
          );
        })}
        {/* 結餘顯示兩期合計，不是變化量（spec: 總額比較） */}
        <tr>
          <th scope="row">結餘</th>
          <td>{formatMoney(a.balance)}</td>
          <td>{formatMoney(b.balance)}</td>
          <td className={`diff ${signTone(combinedBalance)}`}>
            <span className="combined-label">合計</span>
            {formatMoney(combinedBalance)}
            {/* 留同寬空位讓三列數字對齊 */}
            <span className="percent" aria-hidden="true" />
          </td>
        </tr>
      </tbody>
    </table>
  );
}
