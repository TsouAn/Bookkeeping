export default function Tabs({ tabs, active, onChange }) {
  return (
    // 欄數跟著頁籤數量走，新增頁籤時不必改 CSS
    <nav className="tabs" role="tablist" style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
      {tabs.map(([value, label]) => (
        <button
          key={value}
          type="button"
          role="tab"
          aria-selected={active === value}
          className={`tab ${active === value ? 'active' : ''}`}
          onClick={() => onChange(value)}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}
