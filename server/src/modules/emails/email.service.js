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
