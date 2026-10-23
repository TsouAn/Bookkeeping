import { useState } from 'react';
import { formatSigned } from '../format.js';

export default function TransactionList({ transactions, onDelete, highlightId }) {
  // 正在確認刪除的那一筆。不用 window.confirm，因為部分瀏覽器（如 App 內嵌瀏覽器）會封鎖對話框
  const [confirmingId, setConfirmingId] = useState(null);

  return (
    <div className="ledger-list">
      <h2 className="card-title">明細</h2>
      {transactions.length === 0 ? (
        <p className="empty">這個月還沒有記錄</p>
      ) : (
        <ul className="transaction-list">
          {transactions.map((t) => (
            <li key={t.id} className={`transaction ${t.id === highlightId ? 'is-new' : ''}`}>
              <span className="t-date">{t.date.slice(5).replace('-', '/')}</span>
              <span className="t-main">
                <span className="t-category">{t.category}</span>
                {t.note && <span className="t-note">{t.note}</span>}
              </span>
              {confirmingId === t.id ? (
                // 刪除前必須確認（spec: 刪除收支記錄）
                <span className="confirm-delete" role="group" aria-label="確認刪除">
                  <span className="confirm-text">確定刪除？</span>
                  <button
                    type="button"
                    className="confirm-yes"
                    onClick={() => {
                      setConfirmingId(null);
                      onDelete(t.id);
                    }}
                  >
                    刪除
                  </button>
                  <button type="button" className="confirm-no" onClick={() => setConfirmingId(null)}>
                    取消
                  </button>
                </span>
              ) : (
                <>
                  <span className={`t-amount ${t.type}`}>{formatSigned(t.type, t.amount)}</span>
                  <button
                    type="button"
                    className="delete-button"
                    aria-label={`刪除 ${t.category} ${t.amount}`}
                    onClick={() => setConfirmingId(t.id)}
                  >
                    ×
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
