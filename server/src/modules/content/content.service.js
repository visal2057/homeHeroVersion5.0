import path from 'path';
import fs from 'fs/promises';
import { AppError } from '../../utils/AppError.js';
import { env } from '../../config/environment.js';
import { logAction } from '../audit/audit.service.js';
import { validateImageDimensions } from '../../utils/imageValidation.js';
import { findActiveAssetByType, replaceActiveAsset } from './content.queries.js';

const ASSET_TYPES = ['HOME_HERO_IMAGE', 'LOGIN_SIDE_IMAGE'];

function toPublicUrl(storagePath) {
  const relative = path.relative(env.publicStoragePath, storagePath).split(path.sep).join('/');
  return `/public/${relative}`;
}

function toDto(asset) {
  if (!asset) return null;
  return {
    siteMediaAssetId: asset.site_media_asset_id,
    assetType: asset.asset_type,
    url: toPublicUrl(asset.storage_path),
    altText: asset.alt_text,
    createdAt: asset.created_at,
  };
}

export async function getSiteImages() {
  const results = await Promise.all(ASSET_TYPES.map((type) => findActiveAssetByType(type)));
  return ASSET_TYPES.reduce((acc, type, index) => {
    acc[type] = toDto(results[index].rows[0]);
    return acc;
  }, {});
}

export async function updateSiteImage({ assetType, file, altText }, uploadedByUserId) {
  if (!file) {
    throw new AppError('An image file is required', 422);
  }

  try {
    const buffer = await fs.readFile(file.path);
    validateImageDimensions(buffer);
  } catch (err) {
    await fs.unlink(file.path).catch(() => {});
    throw err;
  }

  const asset = await replaceActiveAsset({
    assetType,
    storagePath: file.path,
    originalFilename: file.originalname,
    mimeType: file.mimetype,
    fileSizeBytes: file.size,
    altText,
    uploadedByUserId,
  });

  await logAction({
    actorUserId: uploadedByUserId,
    actionCode: 'SITE_IMAGE_UPDATED',
    entityType: 'site_media_asset',
    entityId: asset.site_media_asset_id,
    description: `${assetType === 'HOME_HERO_IMAGE' ? 'Home page hero image' : 'Login page background image'} was updated`,
  });

  return toDto(asset);
}
