import { AppError } from '../../utils/AppError.js';
import {
  findCategoryByCode,
  findTopProviders,
  findAvailableProviders,
  getPublicProviderCore,
  getProviderCategories,
  getProviderUnavailablePeriods,
  getProviderPortfolioPosts,
  getProviderReviews,
} from './provider.queries.js';

const TOP_PROVIDERS_LIMIT = 5;
const AVAILABLE_PROVIDERS_LIMIT = 20;

function slugToCategoryCode(slug) {
  return slug.toUpperCase().replace(/-/g, '_');
}

async function resolveCategory(categorySlug) {
  const { rows } = await findCategoryByCode(slugToCategoryCode(categorySlug));
  if (rows.length === 0) {
    throw new AppError('Unknown service category', 404);
  }
  return rows[0];
}

function toCardShape(row) {
  return {
    providerId: row.provider_user_id,
    id: row.provider_user_id,
    name: row.provider_name,
    providerToken: row.provider_token,
    profilePhoto: row.profile_image_url ?? null,
    district: row.district_name?.toLowerCase() ?? null,
    averageRating: row.average_rating != null ? Number(row.average_rating) : null,
    hourlyRate: row.hourly_charge_estimate != null ? Number(row.hourly_charge_estimate) : null,
    isVerified: row.is_verified,
    isAvailable: row.is_bookable ?? null,
  };
}

export async function searchProviders({ categorySlug, district, search }) {
  const category = await resolveCategory(categorySlug);
  const districtFilter = district ? `%${district}%` : null;
  const searchFilter = search ? search : null;

  const [{ rows: topRows }, { rows: availableRows }] = await Promise.all([
    findTopProviders(category.service_category_id, { district: districtFilter, search: searchFilter }, TOP_PROVIDERS_LIMIT),
    findAvailableProviders(category.service_category_id, { district: districtFilter, search: searchFilter }, AVAILABLE_PROVIDERS_LIMIT),
  ]);

  return {
    category: { id: category.service_category_id, code: category.category_code, name: category.category_name },
    topProviders: topRows.map(toCardShape),
    providers: availableRows.map(toCardShape),
  };
}

export async function getPublicProviderProfile(providerId, categorySlug = null) {
  const { rows } = await getPublicProviderCore(providerId);
  if (rows.length === 0) {
    throw new AppError('Service Provider not found', 404);
  }
  const core = rows[0];

  const [{ rows: categoryRows }, { rows: unavailableRows }, portfolioPosts] = await Promise.all([
    getProviderCategories(providerId),
    getProviderUnavailablePeriods(providerId),
    getPublicProviderPortfolio(providerId),
  ]);

  const categories = categoryRows.map((c) => c.category_name);
  // A provider may offer up to two categories; the Explore page is expected to pass which one
  // the client clicked through on (section 15.1), defaulting to the first when not specified.
  const selectedCategory =
    (categorySlug && categoryRows.find((c) => c.category_code === categorySlug.toUpperCase().replace(/-/g, '_'))) ||
    categoryRows[0];

  return {
    providerId: core.user_id,
    id: core.user_id,
    name: core.full_name,
    providerToken: core.user_token,
    profilePhoto: core.profile_image_url ?? null,
    bio: core.bio,
    district: core.service_district_name?.toLowerCase() ?? null,
    categories,
    category: categories.join(' & '),
    serviceCategoryId: selectedCategory?.service_category_id ?? null,
    hourlyRate: core.hourly_charge_estimate != null ? Number(core.hourly_charge_estimate) : null,
    isVerified: core.is_verified,
    isAvailable: core.is_bookable,
    availabilityMessage: core.is_bookable ? null : core.bookability_reason,
    averageRating: core.average_rating != null ? Number(core.average_rating) : null,
    reviewCount: Number(core.review_count ?? 0),
    unavailablePeriods: unavailableRows.map((p) => ({
      startDate: p.unavailable_from,
      endDate: p.unavailable_to,
    })),
    portfolioPosts,
    workImages: portfolioPosts.flatMap((post) => post.images),
  };
}

export async function getPublicProviderPortfolio(providerId) {
  const { rows } = await getProviderPortfolioPosts(providerId);
  return rows.map((row) => ({
    id: row.portfolio_post_id,
    title: row.title,
    description: row.description,
    createdAt: row.created_at,
    images: (row.image_paths ?? []).filter(Boolean),
  }));
}

export async function getPublicProviderReviews(providerId) {
  const { rows } = await getProviderReviews(providerId);
  return rows.map((row) => ({
    id: row.review_id,
    rating: row.rating,
    comment: row.review_text,
    createdAt: row.created_at,
    clientName: row.client_name,
  }));
}
