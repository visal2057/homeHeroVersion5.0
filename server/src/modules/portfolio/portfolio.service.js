import path from 'path';
import { pool } from '../../db/pool.js';
import { AppError } from '../../utils/AppError.js';
import { findBookingForOwnershipCheck } from '../bookings/booking.queries.js';
import {
  findExistingPostForBooking,
  insertPortfolioPost,
  insertPortfolioImage,
  listPortfolioPostsForProvider,
  findPortfolioPostForOwnershipCheck,
  updatePortfolioPostRow,
  deactivatePortfolioPost,
} from './portfolio.queries.js';

function toDto(row) {
  return {
    id: row.portfolio_post_id,
    bookingId: row.booking_id,
    title: row.title,
    description: row.description,
    createdAt: row.created_at,
    images: (row.image_paths ?? []).filter(Boolean),
  };
}

export async function createPortfolioPost(providerUserId, { bookingId, title, description }, files = []) {
  if (!bookingId || !title?.trim() || !description?.trim()) {
    throw new AppError('Booking, title and description are required', 422);
  }
  if (files.length === 0) {
    throw new AppError('At least one image is required', 422);
  }
  if (files.length > 3) {
    throw new AppError('A portfolio post can have at most 3 images', 422);
  }

  const { rows: bookingRows } = await findBookingForOwnershipCheck(bookingId);
  if (bookingRows.length === 0) {
    throw new AppError('Booking not found', 404);
  }
  const booking = bookingRows[0];
  if (Number(booking.provider_user_id) !== Number(providerUserId)) {
    throw new AppError('You do not have permission to post for this booking', 403);
  }
  if (booking.booking_status !== 'COMPLETED') {
    throw new AppError('You can only create a post for a completed booking', 422);
  }

  const { rows: existingRows } = await findExistingPostForBooking(bookingId);
  if (existingRows.length > 0) {
    throw new AppError('A portfolio post already exists for this booking', 409);
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: postRows } = await insertPortfolioPost(client, {
      bookingId,
      providerUserId,
      title: title.trim(),
      description: description.trim(),
    });
    const post = postRows[0];

    let displayOrder = 1;
    for (const file of files) {
      await insertPortfolioImage(client, post.portfolio_post_id, {
        storagePath: `/public/portfolio-images/${path.basename(file.path)}`,
        originalFilename: file.originalname,
        mimeType: file.mimetype,
        fileSizeBytes: file.size,
        displayOrder,
      });
      displayOrder += 1;
    }

    await client.query('COMMIT');
    return { id: post.portfolio_post_id, bookingId: post.booking_id };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function listMyPortfolioPosts(providerUserId) {
  const { rows } = await listPortfolioPostsForProvider(providerUserId);
  return rows.map(toDto);
}

async function assertOwnedPost(postId, providerUserId) {
  const { rows } = await findPortfolioPostForOwnershipCheck(postId);
  if (rows.length === 0) {
    throw new AppError('Portfolio post not found', 404);
  }
  if (Number(rows[0].provider_user_id) !== Number(providerUserId)) {
    throw new AppError('You do not have permission to modify this post', 403);
  }
}

export async function updatePortfolioPost(postId, providerUserId, { title, description }) {
  await assertOwnedPost(postId, providerUserId);
  if (!title?.trim() || !description?.trim()) {
    throw new AppError('Title and description are required', 422);
  }
  const { rows } = await updatePortfolioPostRow(postId, { title: title.trim(), description: description.trim() });
  return toDto(rows[0]);
}

export async function deletePortfolioPost(postId, providerUserId) {
  await assertOwnedPost(postId, providerUserId);
  await deactivatePortfolioPost(postId);
}
