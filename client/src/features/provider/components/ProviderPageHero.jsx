export default function ProviderPageHero({ title, subtitle, image }) {
  return (
    <section className="provider-hero compact">
      <div className="provider-hero-bg" style={{ backgroundImage: `url(${image})` }} role="img" aria-label={title} />
      <div className="provider-hero-overlay" aria-hidden="true" />
      <div className="provider-hero-inner">
        <div>
          <h1 className="provider-hero-greeting">{title}</h1>
          <p className="provider-hero-sub">{subtitle}</p>
        </div>
      </div>
    </section>
  );
}
