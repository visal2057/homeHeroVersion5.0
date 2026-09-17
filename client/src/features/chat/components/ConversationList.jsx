import { getAssetUrl } from '../../../utils/storageUtils.js';
import { SkeletonRows } from '../../../components/common/Skeleton.jsx';
import EmptyState from '../../../components/common/EmptyState.jsx';
import { IconChatBubble } from '../../../components/common/icons.jsx';
import { formatConversationTitle } from '../chatUtils.js';

function ConversationRow({ conversation, isSelected, onSelect }) {
  const { counterpart, lastMessage, unreadCount, serviceCategory, bookingId } = conversation;
  const preview = lastMessage ? lastMessage.text : 'No messages yet — say hello';

  return (
    <button
      type="button"
      className={`chatlist-row${isSelected ? ' is-selected' : ''}`}
      onClick={() => onSelect(conversation.bookingId)}
    >
      {counterpart.photoUrl ? (
        <img src={getAssetUrl(counterpart.photoUrl)} alt="" className="chatlist-avatar-photo" />
      ) : (
        <span className="chatlist-avatar-initials">{(counterpart.name ?? '?')[0]}</span>
      )}
      <div className="chatlist-row-body">
        <div className="chatlist-row-top">
          <span className="chatlist-row-name">{formatConversationTitle(counterpart.name, bookingId)}</span>
          {lastMessage && (
            <span className="chatlist-row-time">
              {new Date(lastMessage.createdAt).toLocaleDateString('en-LK', { day: 'numeric', month: 'short' })}
            </span>
          )}
        </div>
        <div className="chatlist-row-bottom">
          <span className="chatlist-row-preview">{preview}</span>
          {unreadCount > 0 && <span className="chatlist-row-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
        </div>
        <span className="chatlist-row-category">{serviceCategory}</span>
      </div>
    </button>
  );
}

export default function ConversationList({ conversations, loading, selectedBookingId, onSelect }) {
  const ongoing = conversations.filter((c) => c.status === 'ACCEPTED');
  const past = conversations.filter((c) => c.status === 'COMPLETED');

  return (
    <div className="chatlist">
      <div className="chatlist-header">Messages</div>
      <div className="chatlist-scroll">
        {loading ? (
          <div style={{ padding: 'var(--space-md)' }}>
            <SkeletonRows count={4} />
          </div>
        ) : conversations.length === 0 ? (
          <EmptyState
            icon={IconChatBubble}
            title="No conversations yet"
            message="Once a job is accepted, you'll be able to message the other side here."
          />
        ) : (
          <>
            {ongoing.length > 0 && (
              <div className="chatlist-section">
                <p className="chatlist-section-label">Ongoing</p>
                {ongoing.map((c) => (
                  <ConversationRow
                    key={c.bookingId}
                    conversation={c}
                    isSelected={Number(c.bookingId) === selectedBookingId}
                    onSelect={onSelect}
                  />
                ))}
              </div>
            )}
            {past.length > 0 && (
              <div className="chatlist-section">
                <p className="chatlist-section-label">Past</p>
                {past.map((c) => (
                  <ConversationRow
                    key={c.bookingId}
                    conversation={c}
                    isSelected={Number(c.bookingId) === selectedBookingId}
                    onSelect={onSelect}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        .chatlist { display: flex; flex-direction: column; height: 100%; border-right: 1px solid var(--color-neutral-200); background: white; }
        .chatlist-header { padding: var(--space-md) var(--space-lg); font-weight: 700; font-size: var(--font-size-md); color: var(--color-secondary-700); border-bottom: 1px solid var(--color-neutral-100); }
        .chatlist-scroll { flex: 1; overflow-y: auto; }
        .chatlist-section-label { padding: 10px var(--space-lg) 4px; margin: 0; font-size: var(--font-size-xs); font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--color-neutral-400); }
        .chatlist-row { display: flex; align-items: flex-start; gap: 10px; width: 100%; padding: 10px var(--space-lg); background: none; border: none; border-bottom: 1px solid var(--color-neutral-100); cursor: pointer; text-align: left; font-family: inherit; transition: background var(--transition-base); }
        .chatlist-row:hover { background: var(--color-neutral-50); }
        .chatlist-row.is-selected { background: var(--color-primary-50); }
        .chatlist-avatar-initials { width: 40px; height: 40px; border-radius: 50%; background: var(--color-primary-600); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0; }
        .chatlist-avatar-photo { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
        .chatlist-row-body { min-width: 0; flex: 1; }
        .chatlist-row-top { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; }
        .chatlist-row-name { font-weight: 700; font-size: var(--font-size-sm); color: var(--color-secondary-700); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .chatlist-row-time { font-size: var(--font-size-xs); color: var(--color-neutral-400); flex-shrink: 0; }
        .chatlist-row-bottom { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-top: 2px; }
        .chatlist-row-preview { font-size: var(--font-size-xs); color: var(--color-neutral-500); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .chatlist-row-badge { background: var(--color-primary-600); color: white; font-size: 10px; font-weight: 700; min-width: 18px; height: 18px; border-radius: 9px; display: flex; align-items: center; justify-content: center; padding: 0 5px; flex-shrink: 0; }
        .chatlist-row-category { display: block; font-size: 11px; color: var(--color-neutral-400); margin-top: 2px; }
      `}</style>
    </div>
  );
}
