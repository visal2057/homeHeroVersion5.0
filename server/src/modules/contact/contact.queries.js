import { query } from '../../db/query.js';

export function insertContactMessage({ fullName, email, subject, messageBody }) {
  return query(
    `INSERT INTO contact_messages (full_name, email, subject, message_body)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [fullName, email, subject, messageBody],
  );
}
