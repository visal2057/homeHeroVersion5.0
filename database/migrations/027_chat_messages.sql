-- Client<->Provider chat, scoped 1:1 to a booking (booking_id already
-- uniquely identifies the two participants and the job's lifecycle status,
-- so no separate chat_threads table is needed). Messages become writable
-- once a booking is ACCEPTED and read-only once it is COMPLETED (enforced
-- in the application layer, not here, so the exact policy can evolve
-- without a migration).
CREATE TABLE chat_messages (
  chat_message_id  BIGSERIAL PRIMARY KEY,
  booking_id       INTEGER NOT NULL REFERENCES bookings(booking_id) ON DELETE CASCADE,
  sender_user_id   INTEGER NOT NULL REFERENCES users(user_id),
  message_text     TEXT NOT NULL CHECK (char_length(message_text) BETWEEN 1 AND 2000),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at          TIMESTAMPTZ NULL
);

-- Powers both "messages after cursor X" polling and the conversation list's
-- "last message for this booking" lookup.
CREATE INDEX idx_chat_messages_booking_id_created_at
  ON chat_messages (booking_id, chat_message_id);

-- Powers the unread-count badge query (unread messages sent by the *other*
-- participant), filtered further by sender_user_id != viewer at query time.
CREATE INDEX idx_chat_messages_unread
  ON chat_messages (booking_id, sender_user_id)
  WHERE read_at IS NULL;
