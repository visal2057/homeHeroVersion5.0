import fs from 'fs';
import path from 'path';
import { env } from '../../config/environment.js';
import { AppError } from '../../utils/AppError.js';
import { searchProviderJobs } from '../sp-tracking/sp-tracking.service.js';
import { buildSpReportPdfBuffer } from './spReportPdf.js';

// Storage paths are served from "/public/..." (see app.js's static mount),
// which resolves on disk to env.publicStoragePath -- so the same relative
// path just needs that "/public/" prefix swapped for the storage root.
function resolveProfileImagePath(profileImageUrl) {
  if (!profileImageUrl) return null;
  const relative = profileImageUrl.replace(/^\/public\//, '');
  const fullPath = path.resolve(env.publicStoragePath, relative);
  return fs.existsSync(fullPath) ? fullPath : null;
}

export async function buildSpReportPdf(search) {
  const { provider, jobs, stats } = await searchProviderJobs(search);
  if (!provider) {
    throw new AppError('No Service Provider matches that search', 404);
  }

  const buffer = await buildSpReportPdfBuffer({
    provider,
    stats,
    jobs,
    generatedAt: new Date().toLocaleString(),
    profileImagePath: resolveProfileImagePath(provider.profileImageUrl),
  });

  return { buffer, userToken: provider.userToken };
}
