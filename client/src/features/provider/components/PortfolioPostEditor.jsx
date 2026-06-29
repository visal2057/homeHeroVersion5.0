/* Displays the provider's portfolio posts in a grid with an "Add New" button */
export default function PortfolioPostEditor({ posts, onAdd, onDelete }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--space-md)' }}>
        <button type="button" className="btn btn-primary" onClick={onAdd}>
          + Add Portfolio Post
        </button>
      </div>

      {!posts?.length ? (
        <div className="provider-empty-state">
          <div className="provider-empty-state-icon">🖼️</div>
          <p className="provider-empty-state-title">No portfolio posts yet</p>
          <p className="provider-empty-state-desc">Showcase your best work to attract more clients.</p>
        </div>
      ) : (
        <div className="provider-portfolio-grid">
          {posts.map((p) => (
            <div key={p.id} className="provider-portfolio-card">
              {p.image_url ? (
                <img src={p.image_url} alt={p.title} className="provider-portfolio-img" />
              ) : (
                <div className="provider-portfolio-img-placeholder">🖼️</div>
              )}
              <div className="provider-portfolio-info">
                <p className="provider-portfolio-title">{p.title}</p>
                {p.description && <p className="provider-portfolio-desc">{p.description}</p>}
                <button
                  type="button"
                  className="provider-action-btn reject"
                  style={{ marginTop: 'var(--space-sm)' }}
                  onClick={() => onDelete(p.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
