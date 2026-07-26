import { pool } from '../../db/pool.js';
import { AppError } from '../../utils/AppError.js';
import {
  getBookability,
  setManualOnline,
  listFutureUnavailablePeriods,
  deleteFutureUnavailablePeriods,
  insertUnavailablePeriod,
} from './availability.queries.js';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// node-postgres parses DATE columns into a Date set to local midnight (not UTC midnight),
// so formatting must read local Y/M/D parts rather than toISOString(), which would shift
// the date backwards by a day in any timezone ahead of UTC.
function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// The calendar UI lets a provider click individual days, but the database stores
// contiguous ranges, so a flat sorted list of dates is collapsed into the fewest
// possible [from, to] ranges before saving.
function groupIntoRanges(sortedDates) {
  const ranges = [];
  for (const date of sortedDates) {
    const last = ranges[ranges.length - 1];
    if (last && date.getTime() - last.to.getTime() === MS_PER_DAY) {
      last.to = date;
    } else {
      ranges.push({ from: date, to: date });
    }
  }
  return ranges;
}

export async function toggleManualOnline(providerUserId, manualOnline) {
  if (manualOnline) {
    const { rows } = await getBookability(providerUserId);
    if (rows.length === 0) {
      throw new AppError('Service Provider profile not found', 404);
    }
    const bookability = rows[0];
    if (!bookability.is_verified) {
      throw new AppError('Your account is not verified yet, so you cannot go online', 422);
    }
    if (bookability.has_active_ban) {
      throw new AppError('Your account is banned, so you cannot go online', 403);
    }
    if (!bookability.has_valid_membership_or_grace) {
      throw new AppError('You need an active membership before you can go online', 422);
    }
    if (bookability.forced_offline) {
      throw new AppError('Your account was forced offline after your membership grace period ended. Renew your membership to go online again', 422);
    }
  }

  const { rows } = await setManualOnline(providerUserId, manualOnline);
  return { manualOnline: rows[0].manual_online };
}

export async function getUnavailableDates(providerUserId) {
  const { rows } = await listFutureUnavailablePeriods(providerUserId);
  const dates = [];
  for (const row of rows) {
    const cursor = new Date(row.unavailable_from);
    const end = new Date(row.unavailable_to);
    while (cursor.getTime() <= end.getTime()) {
      dates.push(toDateKey(cursor));
      cursor.setTime(cursor.getTime() + MS_PER_DAY);
    }
  }
  return dates;
}

export async function replaceUnavailableDates(providerUserId, dates) {
  const uniqueSorted = [...new Set(dates.map((d) => new Date(d).getTime()))]
    .sort((a, b) => a - b)
    .map((time) => new Date(time));

  const ranges = groupIntoRanges(uniqueSorted);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await deleteFutureUnavailablePeriods(client, providerUserId);
    for (const range of ranges) {
      await insertUnavailablePeriod(client, providerUserId, toDateKey(range.from), toDateKey(range.to));
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  return getUnavailableDates(providerUserId);
}
