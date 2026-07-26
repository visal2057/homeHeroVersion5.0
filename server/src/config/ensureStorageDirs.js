import fs from 'fs';
import path from 'path';
import { env } from './environment.js';

// Uploads are written straight to disk (see uploadFiles.js), which assumes
// these folders already exist. That's true on a normal checkout (each has a
// .gitkeep), but a fresh persistent volume mounted at the storage path is
// empty, so multer's writes would fail with ENOENT the first time anything
// is uploaded after a redeploy. Creating them at boot makes that safe either way.
const REQUIRED_DIRS = [
  path.resolve(env.publicStoragePath, 'profile-images'),
  path.resolve(env.publicStoragePath, 'booking-images'),
  path.resolve(env.publicStoragePath, 'portfolio-images'),
  path.resolve(env.publicStoragePath, 'site-assets'),
  path.resolve(env.privateStoragePath, 'verification-documents'),
  path.resolve(env.privateStoragePath, 'invoices'),
];

export function ensureStorageDirs() {
  for (const dir of REQUIRED_DIRS) {
    fs.mkdirSync(dir, { recursive: true });
  }
}
