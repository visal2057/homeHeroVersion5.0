export default function CategorySelector({ categories, selectedIds, onChange, error }) {
  function toggle(categoryId) {
    const isSelected = selectedIds.includes(categoryId);
    if (isSelected) {
      onChange(selectedIds.filter((id) => id !== categoryId));
      return;
    }
    if (selectedIds.length >= 2) return;
    onChange([...selectedIds, categoryId]);
  }

  return (
    <div className="form-group">
      <label className="form-label">Service Categories (choose one or two)</label>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--space-sm)' }}>
        {categories.map((category) => {
          const isSelected = selectedIds.includes(category.service_category_id);
          const isDisabled = !isSelected && selectedIds.length >= 2;
          return (
            <label
              key={category.service_category_id}
              className="card"
              style={{
                padding: 'var(--space-sm) var(--space-md)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-sm)',
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                borderColor: isSelected ? 'var(--color-primary-400)' : undefined,
                backgroundColor: isSelected ? 'rgba(52, 211, 153, 0.28)' : undefined,
                opacity: isDisabled ? 0.5 : 1,
              }}
            >
              <input
                type="checkbox"
                checked={isSelected}
                disabled={isDisabled}
                onChange={() => toggle(category.service_category_id)}
              />
              {category.category_name}
            </label>
          );
        })}
      </div>
      {error && <div className="form-error">{error}</div>}
    </div>
  );
}
