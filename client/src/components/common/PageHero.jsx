import { motion, useReducedMotion } from 'motion/react';

// Shared banner for every logged-in app page (My Bookings, Explore, Booking
// Confirmation, Complaints, Client Profile, ...). Each of those pages used
// to hand-roll its own copy of this exact photo+overlay+icon+title markup
// and CSS (with slightly different padding/icon sizes every time), so this
// consolidates it into one component with one consistent size scale, and
// gives every one of those pages the same entrance motion for free.
export default function PageHero({ image, icon: Icon, eyebrow, title, subtitle, avatar, extra }) {
  const shouldReduceMotion = useReducedMotion();
  const initial = shouldReduceMotion ? false : { opacity: 0, y: 14 };
  const animate = { opacity: 1, y: 0 };
  const transition = { duration: 0.5, ease: [0.16, 1, 0.3, 1] };

  return (
    <div className="hh-page-hero" style={{ backgroundImage: `url(${image})` }}>
      <div className="hh-page-hero-overlay" aria-hidden="true" />
      <div className="container hh-page-hero-container">
        <motion.div className="hh-page-hero-inner" initial={initial} animate={animate} transition={transition}>
          {avatar ?? (
            <div className="hh-page-hero-icon">
              <Icon size={34} style={{ color: 'white' }} />
            </div>
          )}
          <div className="hh-page-hero-text">
            {eyebrow && <div className="hh-eyebrow" style={{ color: 'rgba(255,255,255,0.75)', marginBottom: 6 }}>{eyebrow}</div>}
            <h1 className="hh-page-hero-title">{title}</h1>
            {subtitle && <p className="hh-page-hero-sub">{subtitle}</p>}
            {extra}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
