function StarRating({ value }) {
  const full = Math.round(value ?? 0);
  return (
    <span className="stars" aria-label={`${value} out of 5 stars`}>
      {'★'.repeat(full)}{'☆'.repeat(5 - full)}
    </span>
  );
}

export default function ProviderSummaryCard({ profile }) {
  const initials = profile?.name
    ? profile.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'SP';

  return (
    <div className="provider-summary-card">
      {profile?.avatar_url ? (
        <img src={profile.avatar_url} alt={profile.name} className="provider-summary-avatar" />
      ) : (
        <div className="provider-summary-avatar-placeholder">{initials}</div>
      )}

      <h2 className="provider-summary-name">{profile?.name ?? 'Service Provider'}</h2>

      <p className="provider-summary-meta">
        {profile?.service_categories?.join(' · ') ?? '—'}
        {profile?.location && <> &bull; {profile.location}</>}
      </p>

      <div className="provider-summary-rating">
        <StarRating value={profile?.average_rating} />
        <span>{profile?.average_rating?.toFixed(1) ?? '—'}</span>
        <span>({profile?.review_count ?? 0} reviews)</span>
      </div>

      <div>
        <span className="provider-summary-chip verified">✓ Verified</span>
        {profile?.membership_type && (
          <span className="provider-summary-chip member">
            ⭐ {profile.membership_type}
          </span>
        )}
      </div>
    </div>
  );
}
