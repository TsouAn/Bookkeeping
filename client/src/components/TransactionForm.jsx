import { useState } from 'react';
import { CATEGORIES } from '../categories.js';
import { taipeiToday } from '../time.js';

export default function TransactionForm({ onSubmit }) {
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES.expense[0]);
  const [date, setDate] = useState(() => taipeiToday());
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 類型切換時，分類選單換成該類型的清單
  function changeType(next) {
    setType(next);
    setCategory(CATEGORIES[next][0]);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      // 驗證以後端為準，前端只把輸入轉成數字送出
      await onSubmit({ type, amount: Number(amount), category, date, note: note.trim() });
      setAmount('');
      setNote('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="card">
      {/* noValidate：不用瀏覽器內建提示，統一顯示後端的錯誤訊息 */}
      <form className="transaction-form" onSubmit={handleSubmit} noValidate>
        <div className="type-toggle" role="radiogroup" aria-label="類型">
          {[
            ['expense', '支出'],
            ['income', '收入'],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={type === value}
              className={`toggle ${value} ${type === value ? 'active' : ''}`}
              onClick={() => changeType(value)}
            >
              {label}
            </button>
          ))}
        </div>

        <label className="field">
          <span>金額</span>
          <input
            type="number"
            inputMode="numeric"
            min="1"
            step="1"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </label>

        <label className="field">
          <span>分類</span>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES[type].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>日期</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>

        <label className="field field-wide">
          <span>備註</span>
          <input
            type="text"
            maxLength={100}
            placeholder="選填，例如：午餐"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </label>

        {error && (
          <p className="form-error field-wide" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="primary field-wide" disabled={submitting}>
          {submitting ? '儲存中…' : `新增${type === 'income' ? '收入' : '支出'}`}
        </button>
      </form>
    </section>
  );
}
