import { pool } from '../../db/pool.js';
import { AppError } from '../../utils/AppError.js';
import { hashPassword, verifyPassword } from '../../utils/passwordUtils.js';
import { findUserById, updateUserPassword, findUserByUsernameOrEmail } from '../auth/auth.queries.js';
import {
  getProviderCoreProfile,
  getProviderCategories,
  getProviderMembership,
  getProviderStatistics,
  getProviderBookability,
  updateProviderBasicInfo,
  updateProviderDetails,
  replaceProviderCategories,
  updateProviderProfileImage,
} from './provider.queries.js';

function toProfileResponse(core, categories, membership, stats, bookability) {
  return {
    userId: core.user_id,
    username: core.username,
    email: core.email,
    fullName: core.full_name,
    phone: core.phone,
    userToken: core.user_token,
    profileImageUrl: core.profile_image_url,
    accountStatus: core.account_status,
    verificationStatus: core.verification_status,
    bio: core.bio,
    workHoursDetails: core.work_hours_details,
    hourlyChargeEstimate: core.hourly_charge_estimate != null ? Number(core.hourly_charge_estimate) : null,
    manualOnline: core.manual_online,
    homeDistrictId: core.home_district_id,
    homeDistrictName: core.home_district_name,
    serviceDistrictId: core.service_district_id,
    serviceDistrictName: core.service_district_name,
    categories: categories.map((c) => ({
      serviceCategoryId: c.service_category_id,
      categoryCode: c.category_code,
      categoryName: c.category_name,
    })),
    membership: membership
      ? {
          status: membership.membership_status,
          startsAt: membership.starts_at,
          expiresAt: membership.expires_at,
          graceEndsAt: membership.grace_ends_at,
          isInGracePeriod: membership.is_in_grace_period,
          categoryCountSnapshot: membership.category_count_snapshot,
        }
      : null,
    statistics: stats
      ? {
          totalCompletedJobs: Number(stats.total_completed_jobs ?? 0),
          currentMonthCompletedJobs: Number(stats.current_month_completed_jobs ?? 0),
          acceptedBookingCount: Number(stats.accepted_booking_count ?? 0),
          rejectedBookingCount: Number(stats.rejected_booking_count ?? 0),
          averageRating: stats.average_rating != null ? Number(stats.average_rating) : null,
          reviewCount: Number(stats.review_count ?? 0),
        }
      : null,
    bookability: bookability
      ? {
          isVerified: bookability.is_verified,
          hasValidMembershipOrGrace: bookability.has_valid_membership_or_grace,
          hasActiveBan: bookability.has_active_ban,
          isBookable: bookability.is_bookable,
          reason: bookability.bookability_reason,
        }
      : null,
  };
}

export async function getProviderProfile(userId) {
  const [{ rows: coreRows }, { rows: categoryRows }, { rows: membershipRows }, { rows: statsRows }, { rows: bookabilityRows }] =
    await Promise.all([
      getProviderCoreProfile(userId),
      getProviderCategories(userId),
      getProviderMembership(userId),
      getProviderStatistics(userId),
      getProviderBookability(userId),
    ]);

  if (coreRows.length === 0) {
    throw new AppError('Service Provider profile not found', 404);
  }

  return toProfileResponse(coreRows[0], categoryRows, membershipRows[0], statsRows[0], bookabilityRows[0]);
}

export async function updateProviderProfile(userId, input) {
  const { rows: existing } = await findUserByUsernameOrEmail(input.username);
  if (existing.length > 0 && Number(existing[0].user_id) !== Number(userId)) {
    throw new AppError('Username is already taken', 409);
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await updateProviderBasicInfo(client, userId, { username: input.username, fullName: input.fullName, phone: input.phone });
    const { rows: detailRows } = await updateProviderDetails(client, userId, {
      bio: input.bio,
      workHoursDetails: input.workHoursDetails,
      hourlyChargeEstimate: input.hourlyChargeEstimate,
      homeDistrictId: input.homeDistrictId,
      serviceDistrictId: input.serviceDistrictId,
    });

    if (detailRows.length === 0) {
      throw new AppError('Service Provider profile not found', 404);
    }

    await replaceProviderCategories(client, userId, input.serviceCategoryIds);

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  return getProviderProfile(userId);
}

export async function updateProviderProfileImagePath(userId, profileImageUrl) {
  const { rows } = await updateProviderProfileImage(userId, profileImageUrl);
  if (rows.length === 0) {
    throw new AppError('Service Provider profile not found', 404);
  }
  return { profileImageUrl: rows[0].profile_image_url };
}

export async function changeProviderPassword(userId, { currentPassword, newPassword }) {
  const { rows } = await findUserById(userId);
  if (rows.length === 0) {
    throw new AppError('Service Provider profile not found', 404);
  }

  const passwordMatches = await verifyPassword(currentPassword, rows[0].password_hash);
  if (!passwordMatches) {
    throw new AppError('Current password is incorrect', 400);
  }

  const passwordHash = await hashPassword(newPassword);
  await updateUserPassword(pool, userId, passwordHash);
}
