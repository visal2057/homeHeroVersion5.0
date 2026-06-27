import path from 'path';
import { pool } from '../../db/pool.js';
import { AppError } from '../../utils/AppError.js';
import { hashPassword } from '../../utils/passwordUtils.js';
import { generateUserToken } from '../../utils/tokenGenerator.js';
import {
  findUserByUsernameOrEmail,
  findUserByEmail,
  findRoleIdByCode,
  checkTokenExists,
  insertUser,
} from '../auth/auth.queries.js';
import {
  listDistricts,
  listServiceCategories,
  insertProviderProfile,
  insertProviderCategory,
  insertVerificationApplication,
  insertVerificationDocument,
} from './registration.queries.js';

const TERMS_VERSION = 'v1';

const DOCUMENT_FIELD_MAP = {
  facePhoto: 'FACE_PHOTO',
  nicFront: 'NIC_FRONT',
  nicBack: 'NIC_BACK',
  policeReport: 'POLICE_REPORT',
};

async function generateUniqueToken() {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const candidate = generateUserToken();
    const { rows } = await checkTokenExists(candidate);
    if (rows.length === 0) return candidate;
  }
  throw new AppError('Could not generate a unique user token, please try again', 500);
}

export async function getRegistrationReference() {
  const [districts, categories] = await Promise.all([listDistricts(), listServiceCategories()]);
  return { districts: districts.rows, serviceCategories: categories.rows };
}

export async function registerProvider(input, files) {
  for (const field of Object.keys(DOCUMENT_FIELD_MAP)) {
    if (!files?.[field]?.[0]) {
      throw new AppError(`${field} is required`, 422);
    }
  }

  const { rows: existingUsername } = await findUserByUsernameOrEmail(input.username);
  if (existingUsername.length > 0) {
    throw new AppError('Username is already taken', 409);
  }

  const { rows: existingEmail } = await findUserByEmail(input.email);
  if (existingEmail.length > 0) {
    throw new AppError('Email is already registered', 409);
  }

  const { rows: roleRows } = await findRoleIdByCode('SERVICE_PROVIDER');
  if (roleRows.length === 0) {
    throw new AppError('Service Provider role is not configured', 500);
  }

  const passwordHash = await hashPassword(input.password);
  const userToken = await generateUniqueToken();

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: userRows } = await insertUser(client, {
      roleId: roleRows[0].role_id,
      username: input.username,
      email: input.email,
      passwordHash,
      userToken,
      fullName: input.fullName,
      phone: input.phone,
    });
    const user = userRows[0];

    await insertProviderProfile(client, {
      userId: user.user_id,
      homeDistrictId: input.homeDistrictId,
      serviceDistrictId: input.serviceDistrictId,
      bio: input.bio,
      workHoursDetails: input.workHoursDetails,
      hourlyChargeEstimate: input.hourlyChargeEstimate,
    });

    for (const categoryId of input.serviceCategoryIds) {
      await insertProviderCategory(client, user.user_id, categoryId);
    }

    const { rows: applicationRows } = await insertVerificationApplication(client, {
      providerUserId: user.user_id,
      policeStationName: input.policeStationName,
      policeReportDate: input.policeReportDate,
      termsVersion: TERMS_VERSION,
    });
    const application = applicationRows[0];

    for (const [field, documentType] of Object.entries(DOCUMENT_FIELD_MAP)) {
      const file = files[field][0];
      await insertVerificationDocument(client, {
        applicationId: application.verification_application_id,
        documentType,
        storagePath: path.relative(process.cwd(), file.path),
        originalFilename: file.originalname,
        mimeType: file.mimetype,
        fileSizeBytes: file.size,
      });
    }

    await client.query('COMMIT');

    return {
      userId: user.user_id,
      username: user.username,
      userToken: user.user_token,
      verificationStatus: 'PENDING',
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
