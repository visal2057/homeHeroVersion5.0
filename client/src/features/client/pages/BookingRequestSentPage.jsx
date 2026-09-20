import { Link, useLocation } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { ROUTES } from '../../../constants/routes.js';
import { IconCheckCircle, IconClipboardList, IconHome } from '../../../components/common/icons.jsx';

function buildSteps(isPublicBooking) {
  return [
    { label: 'Request Sent', desc: isPublicBooking ? 'Your public booking request is with every provider in the category' : 'Your booking request is with the provider', done: true },
    { label: isPublicBooking ? 'Providers Review' : 'Provider Review', desc: isPublicBooking ? 'The first provider to accept is assigned the job' : 'Provider accepts or declines (within 24h)', done: false },
    { label: 'Job Completed', desc: 'Service is delivered, then pay and leave a review', done: false },
  ];
}

export default function BookingRequestSentPage() {
  const { state } = useLocation();
  const bookingId = state?.bookingId;
  const isPublicBooking = Boolean(state?.isPublicBooking);
  const STEPS = buildSteps(isPublicBooking);
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="brs-page">
      <div className="container">
        <motion.div
          className="brs-card"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            className="brs-icon"
            initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <IconCheckCircle size={77} style={{ color: 'var(--color-primary-600)' }} />
          </motion.div>
          <h1 className="brs-title">Booking Request Sent!</h1>
          <p className="brs-sub">
            {isPublicBooking
              ? <>Your public booking request has been sent to every provider in this category. Whoever accepts first will be assigned the job.</>
              : <>Your booking request has been submitted successfully. The provider will review and respond within <strong>24 hours</strong>.</>}
          </p>

          {bookingId && (
            <div className="brs-booking-ref">
              <div className="brs-ref-label">Booking Reference</div>
              <div className="brs-ref-id">#{bookingId}</div>
              <div className="brs-ref-hint">Keep this reference for your records</div>
            </div>
          )}

          <div className="brs-steps">
            {STEPS.map((step, i) => (
              <div key={step.label}>
                <motion.div
                  className={`brs-step${step.done ? ' brs-step-done' : ''}`}
                  initial={shouldReduceMotion ? false : { opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className={`brs-step-dot${step.done ? ' brs-step-dot-done' : ''}`}>{i + 1}</div>
                  <div>
                    <div className="brs-step-label">{step.label}</div>
                    <div className="brs-step-desc">{step.desc}</div>
                  </div>
                </motion.div>
                {i < STEPS.length - 1 && <div className="brs-step-line" />}
              </div>
            ))}
          </div>

          <div className="brs-actions">
            <Link to={ROUTES.CLIENT_MY_BOOKINGS} className="btn btn-primary btn-shine">
              <IconClipboardList size={19} style={{ marginRight: 6 }} />
              View My Bookings
            </Link>
            <Link to={ROUTES.HOME} className="btn btn-outline">
              <IconHome size={19} style={{ marginRight: 6 }} />
              Back to Home
            </Link>
          </div>
        </motion.div>
      </div>

      <style>{`
        .brs-page { padding: var(--space-2xl) 0; display: flex; align-items: center; min-height: 60vh; }
        .brs-card {
          max-width: 672px; margin: 0 auto; text-align: center;
          background: white; border-radius: var(--radius-lg); padding: var(--space-2xl);
          border: 1px solid var(--color-neutral-200); box-shadow: var(--shadow-md);
        }
        .brs-icon { display: flex; justify-content: center; margin-bottom: var(--space-lg); }
        .brs-title { font-size: var(--font-size-2xl); color: var(--color-secondary-700); margin-bottom: var(--space-md); }
        .brs-sub { color: var(--color-neutral-500); margin-bottom: var(--space-xl); font-size: var(--font-size-lg); line-height: 1.6; }
        .brs-booking-ref {
          background: var(--color-primary-50); border: 1px solid var(--color-primary-200);
          border-radius: var(--radius-md); padding: var(--space-lg);
          margin-bottom: var(--space-xl);
        }
        .brs-ref-label { font-size: var(--font-size-xs); text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-primary-600); font-weight: 700; margin-bottom: 4px; }
        .brs-ref-id { font-size: var(--font-size-2xl); font-weight: 800; color: var(--color-secondary-700); font-family: monospace; margin-bottom: 4px; }
        .brs-ref-hint { font-size: var(--font-size-xs); color: var(--color-neutral-400); }
        .brs-steps { text-align: left; margin-bottom: var(--space-xl); }
        .brs-step { display: flex; gap: var(--space-md); align-items: flex-start; }
        .brs-step-line { width: 2px; height: 29px; background: var(--color-neutral-200); margin-left: 21px; }
        .brs-step-dot {
          width: 43px; height: 43px; border-radius: 50%;
          background: var(--color-neutral-100); border: 2px solid var(--color-neutral-300);
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: var(--font-size-sm); color: var(--color-neutral-500); flex-shrink: 0;
        }
        .brs-step-dot-done { background: var(--color-primary-600); border-color: var(--color-primary-600); color: white; }
        .brs-step-label { font-weight: 600; color: var(--color-secondary-700); margin-bottom: 2px; }
        .brs-step-desc { font-size: var(--font-size-sm); color: var(--color-neutral-500); }
        .brs-step-done .brs-step-label { color: var(--color-primary-700); }
        .brs-actions { display: flex; gap: var(--space-md); flex-wrap: wrap; justify-content: center; align-items: center; }

        /* .brs-card's var(--space-2xl) padding leaves barely more than
           half the viewport width for content on a phone - ease it back
           so the reference number and step list aren't so cramped. */
        @media (max-width: 480px) {
          .brs-card { padding: var(--space-xl) var(--space-lg); }
        }
      `}</style>
    </div>
  );
}
