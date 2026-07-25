import { AppError } from '../../utils/AppError.js';
import { logAction } from '../audit/audit.service.js';
import {
  promoteDueScheduledAnnouncements,
  listAnnouncements,
  findAnnouncementById,
  insertAnnouncement,
  updateAnnouncementRow,
  archiveAnnouncementRow,
  listActiveForAudience,
  markAnnouncementRead,
} from './announcement.queries.js';

function toDto(row) {
  return {
    announcementId: row.announcement_id,
    title: row.title,
    messageBody: row.message_body,
    audience: row.audience,
    status: row.announcement_status,
    scheduledFor: row.scheduled_for,
    publishedAt: row.published_at,
    archivedAt: row.archived_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    isRead: row.is_read ?? false,
  };
}

function resolveStatusFields(publicationMode, scheduledFor) {
  if (publicationMode === 'PUBLISH_NOW') {
    return { status: 'ACTIVE', scheduledFor: null, publishedAt: new Date().toISOString() };
  }
  if (publicationMode === 'SCHEDULE') {
    return { status: 'SCHEDULED', scheduledFor, publishedAt: null };
  }
  return { status: 'DRAFT', scheduledFor: null, publishedAt: null };
}

export async function listAllAnnouncements(status) {
  await promoteDueScheduledAnnouncements();
  const { rows } = await listAnnouncements({ status });
  return rows.map(toDto);
}

export async function createAnnouncement(input, createdByUserId) {
  const fields = resolveStatusFields(input.publicationMode, input.scheduledFor);
  const { rows } = await insertAnnouncement({
    title: input.title,
    messageBody: input.messageBody,
    audience: input.audience,
    createdByUserId,
    ...fields,
  });

  await logAction({
    actorUserId: createdByUserId,
    actionCode: 'ANNOUNCEMENT_PUBLISHED',
    entityType: 'announcement',
    entityId: rows[0].announcement_id,
    description: `Announcement "${input.title}" was ${fields.status === 'ACTIVE' ? 'published' : fields.status.toLowerCase()}`,
  });

  return toDto(rows[0]);
}

export async function updateAnnouncement(announcementId, input, actorUserId) {
  const { rows: existingRows } = await findAnnouncementById(announcementId);
  if (existingRows.length === 0) {
    throw new AppError('Announcement not found', 404);
  }

  const fields = resolveStatusFields(input.publicationMode, input.scheduledFor);
  const { rows } = await updateAnnouncementRow(announcementId, {
    title: input.title,
    messageBody: input.messageBody,
    audience: input.audience,
    ...fields,
  });

  await logAction({
    actorUserId,
    actionCode: 'ANNOUNCEMENT_UPDATED',
    entityType: 'announcement',
    entityId: announcementId,
    description: `Announcement "${input.title}" was updated`,
  });

  return toDto(rows[0]);
}

export async function archiveAnnouncement(announcementId, actorUserId) {
  const { rows } = await archiveAnnouncementRow(announcementId);
  if (rows.length === 0) {
    throw new AppError('Announcement not found', 404);
  }

  await logAction({
    actorUserId,
    actionCode: 'ANNOUNCEMENT_ARCHIVED',
    entityType: 'announcement',
    entityId: announcementId,
    description: `Announcement "${rows[0].title}" was archived`,
  });

  return toDto(rows[0]);
}

export async function getActiveAnnouncementsForRole(role, userId) {
  await promoteDueScheduledAnnouncements();
  const audiences = role === 'CLIENT' ? ['ALL_USERS', 'CLIENTS'] : role === 'SERVICE_PROVIDER' ? ['ALL_USERS', 'SERVICE_PROVIDERS'] : ['ALL_USERS'];
  const { rows } = await listActiveForAudience(audiences, userId);
  return rows.map(toDto);
}

export async function markRead(announcementId, userId) {
  const { rows } = await findAnnouncementById(announcementId);
  if (rows.length === 0) {
    throw new AppError('Announcement not found', 404);
  }
  await markAnnouncementRead(announcementId, userId);
}

// Called on a schedule (see jobs/scheduledAnnouncements.job.js). The other
// two call sites above already promote due announcements lazily on read,
// so this isn't the only thing keeping Scheduled -> Active correct -- it
// just makes that promotion happen close to the scheduled time even if
// nobody happens to load an announcement list right then (spec §39.3).
export async function runScheduledAnnouncementPromotion() {
  const { rows } = await promoteDueScheduledAnnouncements();

  for (const row of rows) {
    await logAction({
      actorUserId: null,
      actionCode: 'ANNOUNCEMENT_PUBLISHED',
      entityType: 'announcement',
      entityId: row.announcement_id,
      description: `Scheduled announcement "${row.title}" was automatically published`,
    });
  }

  return { promotedCount: rows.length };
}
