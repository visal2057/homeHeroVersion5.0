import { insertContactMessage } from './contact.queries.js';

export async function submitContactMessage(input) {
  const { rows } = await insertContactMessage(input);
  return rows[0];
}
