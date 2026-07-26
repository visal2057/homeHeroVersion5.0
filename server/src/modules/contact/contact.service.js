import { insertContactMessage } from './contact.queries.js';
import { sendContactNotificationEmail } from '../emails/email.service.js';

export async function submitContactMessage(input) {
  const { rows } = await insertContactMessage(input);
  // sendEmail (used underneath) already catches its own errors and never
  // rejects, so the message is never lost from contact_messages just
  // because the notification email failed to send.
  await sendContactNotificationEmail(input);
  return rows[0];
}
