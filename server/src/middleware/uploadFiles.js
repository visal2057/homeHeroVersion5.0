import path from 'path';
import crypto from 'crypto';
import multer from 'multer';
import { env } from '../config/environment.js';
import { AppError } from '../utils/AppError.js';

const IMAGE_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png']);
const POLICE_REPORT_TYPES = new Set([...IMAGE_TYPES, 'application/pdf']);
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(env.privateStoragePath, 'verification-documents'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  const allowed = file.fieldname === 'policeReport' ? POLICE_REPORT_TYPES : IMAGE_TYPES;

  if (!allowed.has(file.mimetype)) {
    return cb(new AppError(`Invalid file type for ${file.fieldname}`, 422));
  }

  return cb(null, true);
}

export const uploadVerificationDocuments = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
}).fields([
  { name: 'facePhoto', maxCount: 1 },
  { name: 'nicFront', maxCount: 1 },
  { name: 'nicBack', maxCount: 1 },
  { name: 'policeReport', maxCount: 1 },
]);

const siteAssetStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(env.publicStoragePath, 'site-assets'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

function imageOnlyFilter(req, file, cb) {
  if (!IMAGE_TYPES.has(file.mimetype)) {
    return cb(new AppError('Only JPG and PNG images are allowed', 422));
  }
  return cb(null, true);
}

export const uploadSiteImage = multer({
  storage: siteAssetStorage,
  fileFilter: imageOnlyFilter,
  limits: { fileSize: MAX_FILE_SIZE },
}).single('image');

const profileImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(env.publicStoragePath, 'profile-images'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

export const uploadProfileImage = multer({
  storage: profileImageStorage,
  fileFilter: imageOnlyFilter,
  limits: { fileSize: MAX_FILE_SIZE },
}).single('profileImage');

const bookingImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(env.publicStoragePath, 'booking-images'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

export const uploadBookingImages = multer({
  storage: bookingImageStorage,
  fileFilter: imageOnlyFilter,
  limits: { fileSize: MAX_FILE_SIZE },
}).array('jobPhotos', 3);

const portfolioImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(env.publicStoragePath, 'portfolio-images'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

export const uploadPortfolioImages = multer({
  storage: portfolioImageStorage,
  fileFilter: imageOnlyFilter,
  limits: { fileSize: MAX_FILE_SIZE },
}).array('images', 3);
