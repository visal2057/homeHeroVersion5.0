export default function BookingTabs({ activeTab, onTabChange }) {
  const tabs = [
    { key: 'requests', label: '📨 Requests', desc: 'Pending & approved' },
    { key: 'jobs', label: '🔨 Jobs To Do', desc: 'Upcoming jobs' },
    { key: 'completed', label: '✅ Completed', desc: 'Finished jobs' },
  ];

  return (
    <div className="booking-tabs">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          className={`bt-tab${activeTab === tab.key ? ' bt-tab-active' : ''}`}
          onClick={() => onTabChange(tab.key)}
        >
          <span className="bt-label">{tab.label}</span>
          <span className="bt-desc">{tab.desc}</span>
        </button>
      ))}

      <style>{`
        .booking-tabs {
          display: flex; gap: 0; border-radius: var(--radius-lg);
          background: var(--color-neutral-100); padding: 4px;
          flex-wrap: wrap;
        }
        .bt-tab {
          flex: 1; min-width: 120px; padding: 10px 20px;
          background: none; border: none; cursor: pointer;
          border-radius: calc(var(--radius-lg) - 4px);
          transition: background 0.2s, color 0.2s;
          display: flex; flex-direction: column; align-items: center; gap: 2px;
          font-family: inherit;
        }
        .bt-tab:hover { background: white; }
        .bt-tab-active { background: white; box-shadow: var(--shadow-sm); }
        .bt-label { font-weight: 600; color: var(--color-secondary-700); font-size: var(--font-size-base); }
        .bt-desc { font-size: var(--font-size-xs); color: var(--color-neutral-500); }
        .bt-tab-active .bt-label { color: var(--color-primary-700); }
      `}</style>
    </div>
  );
}
