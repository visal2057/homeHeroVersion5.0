import {
  IconUser, IconCheckCircle, IconXCircle, IconCreditCard, IconCalendar,
  IconCheck, IconDollarSign, IconClock, IconImage, IconChartBar,
} from '../../../../components/common/icons.jsx';
import {
  IconBanSlash, IconUndo, IconMegaphone, IconArchiveBox, IconScale, IconReceipt, IconActivity,
} from './ActivityIcons.jsx';

// Every actionCode ever written by server/src/modules/*/*.service.js's
// logAction() calls is mapped to a real icon component here (not an emoji),
// so past, present, and future audit-log entries all render consistently.
// Unrecognized future codes fall back to DEFAULT rather than breaking.
const ACTION_STYLES = {
  CLIENT_REGISTERED: { icon: IconUser, color: '#2563eb' },
  PROVIDER_APPROVED: { icon: IconCheckCircle, color: '#059669' },
  PROVIDER_REJECTED: { icon: IconXCircle, color: '#dc2626' },
  MEMBERSHIP_PURCHASED: { icon: IconCreditCard, color: '#7c3aed' },
  BOOKING_CREATED: { icon: IconCalendar, color: '#0ea5e9' },
  BOOKING_ACCEPTED: { icon: IconCheck, color: '#059669' },
  PAYMENT_COMPLETED: { icon: IconDollarSign, color: '#0f766e' },
  USER_BANNED: { icon: IconBanSlash, color: '#dc2626' },
  USER_UNBANNED: { icon: IconUndo, color: '#059669' },
  USER_BAN_EXPIRED: { icon: IconClock, color: '#059669' },
  ANNOUNCEMENT_PUBLISHED: { icon: IconMegaphone, color: '#d97706' },
  ANNOUNCEMENT_UPDATED: { icon: IconMegaphone, color: '#d97706' },
  ANNOUNCEMENT_ARCHIVED: { icon: IconArchiveBox, color: '#64748b' },
  SITE_IMAGE_UPDATED: { icon: IconImage, color: '#64748b' },
  EARNINGS_REPORT_GENERATED: { icon: IconChartBar, color: '#0f5132' },
  COMPLAINT_VERDICT_RECORDED: { icon: IconScale, color: '#d97706' },
  INVOICE_GENERATED: { icon: IconReceipt, color: '#0f5132' },
  DEFAULT: { icon: IconActivity, color: '#64748b' },
};

function timeAgo(dateString) {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  return new Date(dateString).toLocaleDateString();
}

export default function RecentActionsList({ actions }) {
  if (!actions || actions.length === 0) {
    return <p className="empty-state">No recent activity yet.</p>;
  }

  return (
    <div className="timeline">
      {actions.map((action, index) => {
        const style = ACTION_STYLES[action.actionCode] ?? ACTION_STYLES.DEFAULT;
        const ActionIcon = style.icon;
        const isLast = index === actions.length - 1;
        return (
          <div key={action.id} className="timeline-item">
            <div className="timeline-icon-col">
              <span className="timeline-icon" style={{ backgroundColor: `${style.color}1F`, color: style.color }}>
                <ActionIcon size={15} />
              </span>
              {!isLast && <span className="timeline-line" />}
            </div>
            <div className="timeline-content">
              <p>{action.description}</p>
              <p className="timeline-time">
                {action.actorName ?? 'System'} &middot; {timeAgo(action.createdAt)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
