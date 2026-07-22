import path from 'path';
import { pool } from '../../db/pool.js';
import { AppError } from '../../utils/AppError.js';
import { hashPassword, verifyPassword } from '../../utils/passwordUtils.js';
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
  deleteProviderCategories,
  insertVerificationApplication,
  insertVerificationDocument,
  countVerificationApplications,
  updateProviderProfileForReapplication,
  updateUserForReapplication,
} from './registration.queries.js';

const TERMS_VERSION = 'v1';

// A rejected Service Provider may resubmit the same application (same
// username/email/account) up to this many times in total, counting the
// original submission. Once the count reaches this cap and the latest
// attempt is rejected, that identity is permanently done - no further
// reapplication, and (since the account is never deleted) that
// username/email can never be reused for a fresh signup either.
const MAX_VERIFICATION_ATTEMPTS = 3;

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

// Recognizes the one collision case that should NOT be a hard "already
// registered" error: the same rejected Service Provider account resubmitting
// with the identical username AND email. Every other collision (a
// different account, a different role, an account that's still PENDING or
// already APPROVED, or only one of username/email matching) keeps the
// original strict behavior. Returns null for a genuinely fresh signup.
async function resolveReapplicant(existingUsername, existingEmail, input) {
  if (existingUsername.length === 0 && existingEmail.length === 0) {
    return null;
  }

  const usernameMatch = existingUsername[0];
  const emailMatch = existingEmail[0];
  const sameAccount = Boolean(usernameMatch && emailMatch && usernameMatch.user_id === emailMatch.user_id);

  if (!sameAccount || usernameMatch.role_code !== 'SERVICE_PROVIDER' || usernameMatch.verification_status !== 'REJECTED') {
    if (existingUsername.length > 0) {
      throw new AppError('Username is already taken', 409);
    }
    throw new AppError('Email is already registered', 409);
  }

  const passwordMatches = await verifyPassword(input.password, usernameMatch.password_hash);
  if (!passwordMatches) {
    throw new AppError(
      "This username and email belong to a previously rejected application. Enter that account's current password to reapply, or reset it first with Forgot Password.",
      409,
    );
  }

  const { rows: countRows } = await countVerificationApplications(usernameMatch.user_id);
  const attemptsUsed = countRows[0].count;
  if (attemptsUsed >= MAX_VERIFICATION_ATTEMPTS) {
    throw new AppError(
      `This application has already been rejected ${MAX_VERIFICATION_ATTEMPTS} times and can no longer be resubmitted.`,
      409,
    );
  }

  return {
    userId: usernameMatch.user_id,
    userToken: usernameMatch.user_token,
    nextAttemptNumber: attemptsUsed + 1,
  };
}

// Reuses the existing account graph (users / service_provider_profiles /
// provider_service_categories) rather than inserting new rows, and adds a
// new sp_verification_applications attempt (with its own fresh documents)
// on top of the prior, still-intact rejected attempt(s).
async function reapplyAsProvider(reapplicant, input, files) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await updateUserForReapplication(client, {
      userId: reapplicant.userId,
      fullName: input.fullName,
      phone: input.phone,
    });

    await updateProviderProfileForReapplication(client, {
      userId: reapplicant.userId,
      homeDistrictId: input.homeDistrictId,
      serviceDistrictId: input.serviceDistrictId,
      bio: input.bio,
      workHoursDetails: input.workHoursDetails,
      hourlyChargeEstimate: input.hourlyChargeEstimate,
    });

    await deleteProviderCategories(client, reapplicant.userId);
    for (const categoryId of input.serviceCategoryIds) {
      await insertProviderCategory(client, reapplicant.userId, categoryId);
    }

    const { rows: applicationRows } = await insertVerificationApplication(client, {
      providerUserId: reapplicant.userId,
      attemptNumber: reapplicant.nextAttemptNumber,
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
      userId: reapplicant.userId,
      username: input.username,
      userToken: reapplicant.userToken,
      verificationStatus: 'PENDING',
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function registerProvider(input, files) {
  for (const field of Object.keys(DOCUMENT_FIELD_MAP)) {
    if (!files?.[field]?.[0]) {
      throw new AppError(`${field} is required`, 422);
    }
  }

  const { rows: existingUsername } = await findUserByUsernameOrEmail(input.username);
  const { rows: existingEmail } = await findUserByEmail(input.email);

  const reapplicant = await resolveReapplicant(existingUsername, existingEmail, input);
  if (reapplicant) {
    return reapplyAsProvider(reapplicant, input, files);
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
      attemptNumber: 1,
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
