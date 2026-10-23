export default function Tabs({ tabs, active, onChange }) {
  return (
    <nav className="tabs" role="tablist">
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
