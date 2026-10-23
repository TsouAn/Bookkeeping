import { useEffect, useRef } from 'react';

// 電腦版 ☰ 選單：從左側滑出，選擇項目、按 ✕、點遮罩或按 Esc 都會關閉（spec: app-navigation 電腦版選單）
export default function NavDrawer({ items, active, onSelect, onClose }) {
  const firstItemRef = useRef(null);

  useEffect(() => {
    firstItemRef.current?.focus();
    function handleKey(event) {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div className="drawer-root">
      <div className="drawer-backdrop" onClick={onClose} aria-hidden="true" />
      <nav className="drawer" aria-label="頁面選單">
        <button type="button" className="drawer-close" aria-label="關閉選單" onClick={onClose}>
          ✕
        </button>
        <ul className="drawer-items">
          {items.map(([value, label], i) => (
            <li key={value}>
              <button
                ref={i === 0 ? firstItemRef : undefined}
                type="button"
                className={`drawer-item ${active === value ? 'active' : ''}`}
                aria-current={active === value ? 'page' : undefined}
                onClick={() => onSelect(value)}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
