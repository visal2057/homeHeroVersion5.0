import { query } from '../../db/query.js';
import { pool } from '../../db/pool.js';

export function findActiveAssetByType(assetType) {
  return query(
    `SELECT * FROM site_media_assets WHERE asset_type = $1 AND is_active = true ORDER BY created_at DESC LIMIT 1`,
    [assetType],
  );
}

export async function replaceActiveAsset({ assetType, storagePath, originalFilename, mimeType, fileSizeBytes, altText, uploadedByUserId }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`UPDATE site_media_assets SET is_active = false WHERE asset_type = $1 AND is_active = true`, [
      assetType,
    ]);
    const { rows } = await client.query(
      `INSERT INTO site_media_assets (asset_type, storage_path, original_filename, mime_type, file_size_bytes, alt_text, uploaded_by_user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [assetType, storagePath, originalFilename, mimeType, fileSizeBytes, altText ?? null, uploadedByUserId],
    );
    await client.query('COMMIT');
    return rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
