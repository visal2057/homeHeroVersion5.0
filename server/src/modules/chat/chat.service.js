import { AppError } from '../../utils/AppError.js';
import { createNotification } from '../notifications/notification.service.js';
import { findBookingForOwnershipCheck } from '../bookings/booking.queries.js';
import {
  findMessagesAfter,
  insertMessage,
  markMessagesRead,
  countUnreadForUser,
  findConversationsForUser,
  findJobDetailsForBooking,
} from './chat.queries.js';

// A booking's chat is derived live from its current status - there's no
// separate "thread open/closed" state to keep in sync. Both sides may still
// read history once a job is COMPLETED; only ACCEPTED allows new messages.
const READABLE_STATUSES = ['ACCEPTED', 'COMPLETED'];

async function assertParticipant(bookingId, userId) {
  const { rows } = await findBookingForOwnershipCheck(bookingId);
  if (rows.length === 0) {
    throw new AppError('Booking not found', 404);
  }
  const booking = rows[0];
  if (Number(booking.client_user_id) !== Number(userId) && Number(booking.provider_user_id) !== Number(userId)) {
    throw new AppError('You do not have access to this chat', 403);
  }
  return booking;
}

function toMessageShape(row) {
  return {
    messageId: row.chat_message_id,
    bookingId: row.booking_id,
    senderUserId: row.sender_user_id,
    text: row.message_text,
    createdAt: row.created_at,
    readAt: row.read_at,
  };
}

export async function listConversations(userId) {
  const { rows } = await findConversationsForUser(userId);
  return rows.map((row) => ({
    bookingId: row.booking_id,
    status: row.booking_status,
    serviceCategory: row.service_category,
    counterpart: {
      userId: row.counterpart_user_id,
      name: row.counterpart_name,
      photoUrl: row.counterpart_photo,
    },
    lastMessage: row.last_message_text
      ? {
          text: row.last_message_text,
          createdAt: row.last_message_at,
          senderUserId: row.last_message_sender_user_id,
        }
      : null,
    unreadCount: Number(row.unread_count ?? 0),
  }));
}

export async function listMessages(bookingId, userId, afterId) {
  const booking = await assertParticipant(bookingId, userId);
  if (!READABLE_STATUSES.includes(booking.booking_status)) {
    throw new AppError('Chat is not available for this booking', 403);
  }
  const { rows } = await findMessagesAfter(bookingId, afterId ?? 0, 200);
  return { messages: rows.map(toMessageShape), canSend: booking.booking_status === 'ACCEPTED' };
}

export async function sendMessage(bookingId, senderUserId, text) {
  const booking = await assertParticipant(bookingId, senderUserId);
  if (booking.booking_status !== 'ACCEPTED') {
    throw new AppError('Messages can only be sent while the job is in progress', 409);
  }

  const { rows } = await insertMessage(bookingId, senderUserId, text);
  const message = toMessageShape(rows[0]);

  const recipientUserId = Number(booking.client_user_id) === Number(senderUserId)
    ? booking.provider_user_id
    : booking.client_user_id;

  await createNotification({
    recipientUserId,
    title: 'New message',
    message: text.length > 140 ? `${text.slice(0, 140)}…` : text,
    relatedType: 'CHAT_MESSAGE',
    relatedId: bookingId,
  });

  return message;
}

export async function getJobDetails(bookingId, userId) {
  await assertParticipant(bookingId, userId);
  const { rows } = await findJobDetailsForBooking(bookingId);
  if (rows.length === 0) {
    throw new AppError('Booking not found', 404);
  }
  const row = rows[0];
  return {
    bookingId: Number(bookingId),
    jobDescription: row.job_description,
    serviceCategory: row.service_category,
    status: row.booking_status,
    images: row.images ?? [],
  };
}

export async function markRead(bookingId, userId) {
  await assertParticipant(bookingId, userId);
  const { rows } = await markMessagesRead(bookingId, userId);
  return { markedCount: rows.length };
}

export async function getUnreadCount(userId) {
  const { rows } = await countUnreadForUser(userId);
  return { unreadCount: Number(rows[0]?.unread_count ?? 0) };
}
