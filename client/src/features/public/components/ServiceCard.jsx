import { IconLeaf, IconSparkle, IconPaw, IconWrench, IconSnowflake } from '../../../components/common/icons.jsx';

const CATEGORY_ICONS = {
  leaf: IconLeaf,
  sparkle: IconSparkle,
  paw: IconPaw,
  wrench: IconWrench,
  snowflake: IconSnowflake,
};

export default function ServiceCard({ icon, name, description, image, onClick, animationDelayClass = '' }) {
  const CategoryIcon = CATEGORY_ICONS[icon];

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
          {CategoryIcon && <CategoryIcon size={22} />}
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
