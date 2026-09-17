import { useEffect, useRef } from 'react';

function dayLabel(dateStr) {
  const date = new Date(dateStr);
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  if (isToday) return 'Today';
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Groups a flat message list into per-day sections, WhatsApp-style, so a
// long-running conversation still reads as a timeline rather than one
// undifferentiated stream of bubbles.
function groupByDay(messages) {
  const groups = [];
  for (const message of messages) {
    const label = dayLabel(message.createdAt);
    const last = groups[groups.length - 1];
    if (last && last.label === label) {
      last.items.push(message);
    } else {
      groups.push({ label, items: [message] });
    }
  }
  return groups;
}

export default function MessageList({ messages, currentUserId }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length]);

  const groups = groupByDay(messages);

  return (
    <div className="msglist">
      {messages.length === 0 ? (
        <p className="msglist-empty">No messages yet — send the first one below.</p>
      ) : (
        groups.map((group) => (
          <div key={group.label}>
            <div className="msglist-day-divider"><span>{group.label}</span></div>
            {group.items.map((message) => {
              const isOwn = Number(message.senderUserId) === Number(currentUserId);
              return (
                <div key={message.messageId} className={`msglist-row${isOwn ? ' is-own' : ''}`}>
                  <div className="msglist-bubble">
                    <span className="msglist-bubble-text">{message.text}</span>
                    <span className="msglist-bubble-time">
                      {new Date(message.createdAt).toLocaleTimeString('en-LK', { hour: 'numeric', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ))
      )}
      <div ref={bottomRef} />

      <style>{`
        .msglist { flex: 1; overflow-y: auto; padding: var(--space-md) var(--space-lg); display: flex; flex-direction: column; }
        .msglist-empty { text-align: center; color: var(--color-neutral-400); font-size: var(--font-size-sm); margin: auto; }
        .msglist-day-divider { text-align: center; margin: var(--space-sm) 0; }
        .msglist-day-divider span { font-size: 11px; font-weight: 600; color: var(--color-neutral-400); background: var(--color-neutral-100); padding: 2px 12px; border-radius: var(--radius-full); }
        .msglist-row { display: flex; margin-bottom: 6px; }
        .msglist-row.is-own { justify-content: flex-end; }
        .msglist-bubble { max-width: 72%; padding: 8px 12px; border-radius: var(--radius-lg); background: var(--color-neutral-100); color: var(--color-neutral-700); display: flex; flex-direction: column; gap: 2px; }
        .msglist-row.is-own .msglist-bubble { background: var(--color-primary-600); color: white; }
        .msglist-bubble-text { font-size: var(--font-size-sm); white-space: pre-wrap; word-break: break-word; }
        .msglist-bubble-time { font-size: 10px; opacity: 0.7; align-self: flex-end; }
      `}</style>
    </div>
  );
}
