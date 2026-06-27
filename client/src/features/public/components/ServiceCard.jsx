export default function ServiceCard({ icon, name, description, image, onClick, animationDelayClass = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`hh-service-tile animate-fade-in-up ${animationDelayClass}`}
      aria-label={name}
    >
      <div className="hh-service-media">
        <img src={image} alt="" loading="lazy" />
        <span className="hh-service-icon-badge" aria-hidden="true">
          {icon}
        </span>
      </div>
      <div className="hh-service-body">
        <h3>{name}</h3>
        <p>{description}</p>
        <span className="hh-service-link">
          Explore service <span className="hh-arrow" aria-hidden="true">→</span>
        </span>
      </div>
    </button>
  );
}
