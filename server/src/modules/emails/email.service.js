import { mailTransport } from '../../config/email.js';
import { env } from '../../config/environment.js';
import { logger } from '../../utils/logger.js';

export async function sendEmail({ to, subject, html }) {
  try {
    await mailTransport.sendMail({ from: env.smtp.from, to, subject, html });
  } catch (err) {
    logger.error('Failed to send email', { to, subject, error: err.message });
  }
}

export function sendWelcomeEmail(user) {
  return sendEmail({
    to: user.email,
    subject: 'Welcome to HomeHero',
    html: `<p>Hi ${user.full_name},</p><p>Your HomeHero Client account has been created successfully. You can now log in and start booking trusted service providers.</p>`,
  });
}

export function sendPasswordResetEmail(user, resetLink) {
  return sendEmail({
    to: user.email,
    subject: 'Reset your HomeHero password',
    html: `<p>Hi ${user.full_name},</p><p>Click the link below to reset your password. This link expires in ${env.passwordResetExpiryMinutes} minutes.</p><p><a href="${resetLink}">${resetLink}</a></p>`,
  });
}

export function sendVerificationApprovedEmail(user) {
  return sendEmail({
    to: user.email,
    subject: 'Your HomeHero Service Provider application was approved',
    html: `<p>Hi ${user.full_name},</p><p>Congratulations! Your Service Provider verification has been approved. You can now <a href="${env.clientUrl}/login">log in</a>.</p><p>Before you can go online and receive bookings, you will need an active HomeHero membership.</p>`,
  });
}

export function sendVerificationRejectedEmail(user, reason) {
  return sendEmail({
    to: user.email,
    subject: 'Your HomeHero Service Provider application',
    html: `<p>Hi ${user.full_name},</p><p>We were unable to approve your Service Provider application at this time.</p><p><strong>Reason:</strong> ${reason}</p><p>You are welcome to correct the issue and reapply.</p>`,
  });
}

export function sendBanEmail(user, { banType, endsAt, reason }) {
  const durationText = banType === 'PERMANENT' ? 'permanently' : `until ${new Date(endsAt).toLocaleString()}`;
  return sendEmail({
    to: user.email,
    subject: 'Your HomeHero account has been banned',
    html: `<p>Hi ${user.full_name},</p><p>Your HomeHero account has been banned ${durationText}.</p><p><strong>Reason:</strong> ${reason}</p>`,
  });
}

export function sendComplaintReceivedEmail(user, complaintId) {
  return sendEmail({
    to: user.email,
    subject: 'Your HomeHero complaint is being reviewed',
    html: `<p>Hi ${user.full_name},</p><p>We have received your complaint (reference #${complaintId}) and it is now under review. Necessary action will be taken.</p>`,
  });
}
