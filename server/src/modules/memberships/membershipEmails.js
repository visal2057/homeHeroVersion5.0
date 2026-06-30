import { sendEmail } from '../emails/email.service.js';

// My module's membership emails. They reuse the shared sendEmail utility
// (built in Dinuka's module) but keep the membership wording here, in my code.

const day = (iso) => new Date(iso).toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' });

export function sendMembershipConfirmationEmail(provider, { paymentType, amount, expiresAt }) {
  const what = paymentType === 'FIRST_PAYMENT' ? 'activated' : 'renewed';
  return sendEmail({
    to: provider.email,
    subject: `Your HomeHero membership has been ${what}`,
    html: `<p>Hi ${provider.full_name},</p>
           <p>Your HomeHero membership has been ${what}. You paid <strong>LKR ${Number(amount).toLocaleString('en-LK', { minimumFractionDigits: 2 })}</strong>.</p>
           <p>Your membership is active until <strong>${day(expiresAt)}</strong>.</p>`,
  });
}

export function sendMembershipExpiryEmail(provider, { graceEndsAt }) {
  return sendEmail({
    to: provider.email,
    subject: 'Your HomeHero membership has expired',
    html: `<p>Hi ${provider.full_name},</p>
           <p>Your HomeHero membership has expired. You have a short grace period until
           <strong>${day(graceEndsAt)}</strong> to renew before you are taken offline and stop
           receiving new bookings.</p>`,
  });
}
