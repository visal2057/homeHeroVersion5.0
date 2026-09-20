import { motion, useReducedMotion } from 'motion/react';

// Shared scroll-entrance wrapper for the client/provider app screens - the
// public homepage already had CSS fade-in-up on load, but nothing revealed
// content as the user actually scrolls through the app pages. Collapses to
// an instant, non-animated render under prefers-reduced-motion.
export default function RevealOnScroll({ children, delay = 0, y = 20, once = true, className, style, as = 'div' }) {
  const shouldReduceMotion = useReducedMotion();
  const MotionTag = motion[as] ?? motion.div;

  if (shouldReduceMotion) {
    const Tag = as;
    return <Tag className={className} style={style}>{children}</Tag>;
  }

  return (
    <MotionTag
      className={className}
      style={style}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount: 0.2 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </MotionTag>
  );
}
