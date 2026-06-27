export default function BanRecommendationForm({ complaint, recommendations, onChange }) {
  const targets = [
    { userId: complaint.complainant.userId, name: complaint.complainant.name, label: 'Complaint sender' },
    { userId: complaint.target.userId, name: complaint.target.name, label: 'Complaint target' },
  ];

  function isSelected(userId) {
    return recommendations.some((rec) => rec.userId === userId);
  }

  function toggle(userId) {
    if (isSelected(userId)) {
      onChange(recommendations.filter((rec) => rec.userId !== userId));
    } else {
      onChange([...recommendations, { userId, banType: 'TEMPORARY', endsAt: '', reason: '' }]);
    }
  }

  function updateRecommendation(userId, field, value) {
    onChange(recommendations.map((rec) => (rec.userId === userId ? { ...rec, [field]: value } : rec)));
  }

  return (
    <div>
      {targets.map((target) => {
        const selected = recommendations.find((rec) => rec.userId === target.userId);
        return (
          <div key={target.userId} style={{ marginBottom: 'var(--space-md)' }}>
            <label className="form-checkbox">
              <input type="checkbox" checked={Boolean(selected)} onChange={() => toggle(target.userId)} />
              {target.label}: {target.name}
            </label>

            {selected && (
              <div style={{ marginLeft: 'var(--space-lg)', marginTop: 'var(--space-sm)' }}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Ban type</label>
                    <select
                      className="form-control"
                      value={selected.banType}
                      onChange={(event) => updateRecommendation(target.userId, 'banType', event.target.value)}
                    >
                      <option value="TEMPORARY">Temporary</option>
                      <option value="PERMANENT">Permanent</option>
                    </select>
                  </div>
                  {selected.banType === 'TEMPORARY' && (
                    <div className="form-group">
                      <label className="form-label">Ends at</label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        value={selected.endsAt}
                        onChange={(event) => updateRecommendation(target.userId, 'endsAt', event.target.value)}
                      />
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Reason</label>
                  <textarea
                    className="form-control"
                    value={selected.reason}
                    onChange={(event) => updateRecommendation(target.userId, 'reason', event.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
