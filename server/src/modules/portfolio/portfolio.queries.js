import { query } from '../../db/query.js';

export function findExistingPostForBooking(bookingId) {
  return query(`SELECT portfolio_post_id FROM portfolio_posts WHERE booking_id = $1`, [bookingId]);
}

export function insertPortfolioPost(client, { bookingId, providerUserId, title, description }) {
  return client.query(
    `INSERT INTO portfolio_posts (booking_id, provider_user_id, title, description)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [bookingId, providerUserId, title, description],
  );
}

export function insertPortfolioImage(client, postId, { storagePath, originalFilename, mimeType, fileSizeBytes, displayOrder }) {
  return client.query(
    `INSERT INTO portfolio_post_images (portfolio_post_id, storage_path, original_filename, mime_type, file_size_bytes, display_order)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [postId, storagePath, originalFilename, mimeType, fileSizeBytes, displayOrder],
  );
}

export function listPortfolioPostsForProvider(providerUserId) {
  return query(
    `SELECT pp.portfolio_post_id, pp.booking_id, pp.title, pp.description, pp.created_at,
            COALESCE(
              array_agg(ppi.storage_path ORDER BY ppi.display_order) FILTER (WHERE ppi.storage_path IS NOT NULL),
              '{}'
            ) AS image_paths
     FROM portfolio_posts pp
     LEFT JOIN portfolio_post_images ppi ON ppi.portfolio_post_id = pp.portfolio_post_id
     WHERE pp.provider_user_id = $1 AND pp.is_active = true
     GROUP BY pp.portfolio_post_id
     ORDER BY pp.created_at DESC`,
    [providerUserId],
  );
}

export function findPortfolioPostForOwnershipCheck(postId) {
  return query(
    `SELECT portfolio_post_id, provider_user_id FROM portfolio_posts WHERE portfolio_post_id = $1 AND is_active = true`,
    [postId],
  );
}

export function updatePortfolioPostRow(postId, { title, description }) {
  return query(
    `UPDATE portfolio_posts SET title = $1, description = $2, updated_at = now() WHERE portfolio_post_id = $3 RETURNING *`,
    [title, description, postId],
  );
}

export function deactivatePortfolioPost(postId) {
  return query(
    `UPDATE portfolio_posts SET is_active = false, updated_at = now() WHERE portfolio_post_id = $1 RETURNING *`,
    [postId],
  );
}
