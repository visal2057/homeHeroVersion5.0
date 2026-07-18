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
            sc.category_name,
            COALESCE(
              array_agg(ppi.storage_path ORDER BY ppi.display_order) FILTER (WHERE ppi.storage_path IS NOT NULL),
              '{}'
            ) AS image_paths
     FROM portfolio_posts pp
     JOIN bookings b ON b.booking_id = pp.booking_id
     JOIN service_categories sc ON sc.service_category_id = b.service_category_id
     LEFT JOIN portfolio_post_images ppi ON ppi.portfolio_post_id = pp.portfolio_post_id
     WHERE pp.provider_user_id = $1 AND pp.is_active = true
     GROUP BY pp.portfolio_post_id, sc.category_name
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
    `UPDATE portfolio_posts SET title = $1, description = $2, updated_at = now() WHERE portfolio_post_id = $3
     RETURNING *`,
    [title, description, postId],
  );
}

// Reads back a single post the same shape listPortfolioPostsForProvider uses,
// so an update always returns the true current image list -- whether or not
// this particular save touched the images -- instead of the caller having to
// guess what changed.
export function getPortfolioPostWithImages(postId) {
  return query(
    `SELECT pp.portfolio_post_id, pp.booking_id, pp.title, pp.description, pp.created_at,
            sc.category_name,
            COALESCE(
              array_agg(ppi.storage_path ORDER BY ppi.display_order) FILTER (WHERE ppi.storage_path IS NOT NULL),
              '{}'
            ) AS image_paths
     FROM portfolio_posts pp
     JOIN bookings b ON b.booking_id = pp.booking_id
     JOIN service_categories sc ON sc.service_category_id = b.service_category_id
     LEFT JOIN portfolio_post_images ppi ON ppi.portfolio_post_id = pp.portfolio_post_id
     WHERE pp.portfolio_post_id = $1
     GROUP BY pp.portfolio_post_id, sc.category_name`,
    [postId],
  );
}

export function deletePortfolioImagesForPost(client, postId) {
  return client.query(`DELETE FROM portfolio_post_images WHERE portfolio_post_id = $1`, [postId]);
}

export function deactivatePortfolioPost(postId) {
  return query(
    `UPDATE portfolio_posts SET is_active = false, updated_at = now() WHERE portfolio_post_id = $1 RETURNING *`,
    [postId],
  );
}
