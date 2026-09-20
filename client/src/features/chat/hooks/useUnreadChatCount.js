import { useEffect, useState, useCallback } from 'react';
import { chatApi } from '../chatApi.js';

const POLL_INTERVAL_MS = 30_000;

// Small badge count for the "Messages" nav entry points. Polls independently
// of whether the Chat page itself is open, same convention as the
// notification bell's own feed poll in PublicHeader.jsx.
export function useUnreadChatCount(enabled = true) {
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    try {
      const res = await chatApi.getUnreadCount();
      setUnreadCount(res.data?.data?.unreadCount ?? 0);
    } catch {
      // non-critical
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return undefined;
    refresh();
    const interval = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [enabled, refresh]);

  return unreadCount;
}
