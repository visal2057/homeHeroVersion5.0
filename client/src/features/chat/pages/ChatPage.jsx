import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth.js';
import { ROLES } from '../../../constants/roles.js';
import { ROUTES } from '../../../constants/routes.js';
import { chatApi } from '../chatApi.js';
import ConversationList from '../components/ConversationList.jsx';
import MessageList from '../components/MessageList.jsx';
import MessageComposer from '../components/MessageComposer.jsx';
import JobDetailsPopover from '../components/JobDetailsPopover.jsx';
import EmptyState from '../../../components/common/EmptyState.jsx';
import { SkeletonRows } from '../../../components/common/Skeleton.jsx';
import { IconChatBubble, IconArrowLeft } from '../../../components/common/icons.jsx';
import { getAssetUrl } from '../../../utils/storageUtils.js';
import { formatConversationTitle } from '../chatUtils.js';

const CONVERSATIONS_POLL_MS = 15_000;
const MESSAGES_POLL_MS = 4_000;

export default function ChatPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const chatBase = user?.role === ROLES.SERVICE_PROVIDER ? ROUTES.PROVIDER_CHAT_BASE : ROUTES.CLIENT_CHAT_BASE;
  const selectedBookingId = bookingId ? Number(bookingId) : null;

  const [conversations, setConversations] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [canSend, setCanSend] = useState(false);
  const [error, setError] = useState(null);
  const [showJobDetails, setShowJobDetails] = useState(false);

  const lastMessageIdRef = useRef(0);
  const jobDetailsRef = useRef(null);

  useEffect(() => {
    if (!showJobDetails) return undefined;
    function handleClickOutside(e) {
      if (jobDetailsRef.current && !jobDetailsRef.current.contains(e.target)) {
        setShowJobDetails(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showJobDetails]);

  const fetchConversations = useCallback(async (silent = false) => {
    if (!silent) setLoadingConversations(true);
    try {
      const res = await chatApi.getConversations();
      setConversations(res.data?.data ?? []);
    } catch {
      if (!silent) setError('Could not load your conversations. Please try again.');
    } finally {
      if (!silent) setLoadingConversations(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    const interval = setInterval(() => fetchConversations(true), CONVERSATIONS_POLL_MS);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  const fetchMessages = useCallback(async (bkId, silent = false) => {
    if (!bkId) return;
    if (!silent) setLoadingMessages(true);
    try {
      const after = silent ? lastMessageIdRef.current : undefined;
      const res = await chatApi.getMessages(bkId, after);
      const { messages: newMessages = [], canSend: allowedToSend = false } = res.data?.data ?? {};
      setCanSend(allowedToSend);
      if (newMessages.length > 0) {
        lastMessageIdRef.current = newMessages[newMessages.length - 1].messageId;
      }
      setMessages((prev) => (silent ? [...prev, ...newMessages] : newMessages));
      chatApi.markRead(bkId).catch(() => {});
    } catch {
      if (!silent) setError('Could not load this conversation.');
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  }, []);

  // Reset the thread state whenever the selected booking changes, then load
  // its first page of messages.
  useEffect(() => {
    lastMessageIdRef.current = 0;
    setMessages([]);
    setError(null);
    setShowJobDetails(false);
    if (selectedBookingId) fetchMessages(selectedBookingId);
  }, [selectedBookingId, fetchMessages]);

  useEffect(() => {
    if (!selectedBookingId) return undefined;
    const interval = setInterval(() => fetchMessages(selectedBookingId, true), MESSAGES_POLL_MS);
    return () => clearInterval(interval);
  }, [selectedBookingId, fetchMessages]);

  async function handleSend(text) {
    const res = await chatApi.sendMessage(selectedBookingId, text);
    const sent = res.data?.data;
    if (sent) {
      lastMessageIdRef.current = sent.messageId;
      setMessages((prev) => [...prev, sent]);
    }
    fetchConversations(true);
  }

  function selectConversation(id) {
    navigate(`${chatBase}/${id}`);
  }

  // bookingId comes back from the API as a string (Postgres bigint), while
  // the route param is coerced to a number above - compare numerically so
  // the two representations actually match.
  const selectedConversation = conversations.find((c) => Number(c.bookingId) === selectedBookingId);

  return (
    <div className="chat-page">
      <div className="container chat-shell-wrap">
        <div className={`chat-shell${selectedBookingId ? ' has-selection' : ''}`}>
          <ConversationList
            conversations={conversations}
            loading={loadingConversations}
            selectedBookingId={selectedBookingId}
            onSelect={selectConversation}
          />

          <div className="chat-thread">
            {!selectedBookingId ? (
              <EmptyState
                icon={IconChatBubble}
                title="Select a conversation"
                message="Choose a job on the left to view or start a chat, or open Messages from a job's row."
              />
            ) : loadingMessages ? (
              <div style={{ padding: 'var(--space-lg)' }}>
                <SkeletonRows count={4} />
              </div>
            ) : error ? (
              <EmptyState title="Something went wrong" message={error} actionLabel="Try Again" onAction={() => fetchMessages(selectedBookingId)} />
            ) : (
              <>
                <div className="chat-thread-header">
                  <button type="button" className="chat-thread-back" aria-label="Back to conversations" onClick={() => navigate(chatBase)}>
                    <IconArrowLeft size={18} />
                  </button>
                  {selectedConversation?.counterpart?.photoUrl ? (
                    <img src={getAssetUrl(selectedConversation.counterpart.photoUrl)} alt="" className="chat-thread-avatar-photo" />
                  ) : (
                    <span className="chat-thread-avatar-initials">{(selectedConversation?.counterpart?.name ?? '?')[0]}</span>
                  )}
                  <div className="chat-thread-title-block">
                    <div className="chat-thread-name">
                      {selectedConversation
                        ? formatConversationTitle(selectedConversation.counterpart?.name, selectedConversation.bookingId)
                        : `Job ${selectedBookingId}`}
                    </div>
                    <div className="chat-thread-meta">{selectedConversation?.serviceCategory ?? ''}</div>
                  </div>

                  <div className="chat-thread-jobdetails-anchor" ref={jobDetailsRef}>
                    <button
                      type="button"
                      className="chat-thread-jobdetails-btn"
                      onClick={() => setShowJobDetails((v) => !v)}
                    >
                      Job details
                    </button>
                    {showJobDetails && (
                      <JobDetailsPopover bookingId={selectedBookingId} onClose={() => setShowJobDetails(false)} />
                    )}
                  </div>
                </div>

                <MessageList messages={messages} currentUserId={user?.userId} />

                {canSend ? (
                  <MessageComposer onSend={handleSend} />
                ) : (
                  <div className="chat-readonly-banner">This job is complete — you can still read this conversation, but new messages can no longer be sent.</div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .chat-page { padding: var(--space-xl) 0 var(--space-2xl); }
        .chat-shell-wrap { display: flex; }
        .chat-shell {
          width: 100%; display: grid; grid-template-columns: 320px 1fr; grid-template-rows: minmax(0, 1fr);
          background: white; border: 1px solid var(--color-neutral-200); border-radius: var(--radius-lg);
          overflow: hidden; box-shadow: var(--shadow-sm); height: min(72vh, 680px);
        }
        /* Without an explicit row track, a CSS Grid row with only auto
           sizing grows to fit its tallest child's full (unclipped) content -
           here, the conversation list once it has enough rows to exceed the
           shell's own height cap - which then stretches both columns to that
           oversized height instead of the container's real 680px, pushing
           the message list/composer down past the visible, clipped area.
           The grid-template-rows above caps the row at the container's
           height, and min-height: 0 here (grid items default to
           min-height: auto, i.e. never shrink below content) lets this
           column's own flex children actually respect that cap instead of
           growing past it. */
        .chat-thread { display: flex; flex-direction: column; min-width: 0; min-height: 0; }
        .chat-thread-header { display: flex; align-items: center; gap: 10px; padding: var(--space-md) var(--space-lg); border-bottom: 1px solid var(--color-neutral-100); }
        .chat-thread-avatar-initials { width: 38px; height: 38px; border-radius: 50%; background: var(--color-primary-600); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0; }
        .chat-thread-avatar-photo { width: 38px; height: 38px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
        .chat-thread-title-block { min-width: 0; flex: 1; }
        .chat-thread-name { font-weight: 700; font-size: var(--font-size-sm); color: var(--color-secondary-700); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .chat-thread-meta { font-size: var(--font-size-xs); color: var(--color-neutral-400); }
        .chat-thread-back { display: none; background: none; border: none; cursor: pointer; padding: 4px; color: var(--color-neutral-500); }
        .chat-thread-jobdetails-anchor { position: relative; flex-shrink: 0; }
        .chat-thread-jobdetails-btn {
          background: var(--color-neutral-100); color: var(--color-neutral-600);
          border: 1px solid var(--color-neutral-200); border-radius: var(--radius-md);
          padding: 7px 14px; font-size: var(--font-size-xs); font-weight: 600;
          cursor: pointer; font-family: inherit; white-space: nowrap;
          transition: background var(--transition-base);
        }
        .chat-thread-jobdetails-btn:hover { background: var(--color-neutral-150, #e8ecf0); }
        .chat-readonly-banner { padding: var(--space-md) var(--space-lg); border-top: 1px solid var(--color-neutral-100); background: var(--color-neutral-50); color: var(--color-neutral-500); font-size: var(--font-size-xs); text-align: center; }
        /* Below 720px there's only room for one pane at a time - the
           conversation list and the open thread swap places instead of
           squeezing side by side, with the back button (hidden on desktop)
           becoming the way to return to the list. */
        @media (max-width: 720px) {
          .chat-shell { grid-template-columns: 1fr; height: min(80vh, 720px); }
          .chat-shell .chatlist { display: flex; }
          .chat-shell.has-selection .chatlist { display: none; }
          .chat-shell:not(.has-selection) .chat-thread { display: none; }
          .chat-thread-back { display: inline-flex; }
        }
      `}</style>
    </div>
  );
}
