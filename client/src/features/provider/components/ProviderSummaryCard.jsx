import { getAssetUrl } from '../../../utils/storageUtils.js';

function StarRating({ value }) {
  const full = Math.round(value ?? 0);
  return (
    <span className="stars" aria-label={`${value} out of 5 stars`}>
      {'★'.repeat(full)}{'☆'.repeat(5 - full)}
    </span>
  );
}

export default function ProviderSummaryCard({ profile }) {
  const initials = profile?.fullName
    ? profile.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'SP';
  const averageRating = profile?.statistics?.averageRating;

  return (
    <div className="provider-summary-card">
      {profile?.profileImageUrl ? (
        <img src={getAssetUrl(profile.profileImageUrl)} alt={profile.fullName} className="provider-summary-avatar" />
      ) : (
        <div className="provider-summary-avatar-placeholder">{initials}</div>
      )}

      <h2 className="provider-summary-name">{profile?.fullName ?? 'Service Provider'}</h2>

      <p className="provider-summary-meta">
        {profile?.categories?.map((c) => c.categoryName).join(' · ') ?? '—'}
        {profile?.serviceDistrictName && <> &bull; {profile.serviceDistrictName}</>}
      </p>

      <div className="provider-summary-rating">
        <StarRating value={averageRating} />
        <span>{averageRating != null ? averageRating.toFixed(1) : '—'}</span>
        <span>({profile?.statistics?.reviewCount ?? 0} reviews)</span>
      </div>

      <div>
        {profile?.bookability?.isVerified && (
          <span className="provider-summary-chip verified">✓ Verified</span>
        )}
        {profile?.membership?.status && (
          <span className="provider-summary-chip member">
            ⭐ {profile.membership.status}
          </span>
        )}
      </div>
    </div>
  );
}
