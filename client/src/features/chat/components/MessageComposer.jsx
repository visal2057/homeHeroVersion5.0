import { useState } from 'react';
import { IconSend } from '../../../components/common/icons.jsx';

export default function MessageComposer({ onSend }) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    try {
      await onSend(trimmed);
      setText('');
    } catch {
      // The parent's fetch layer surfaces the error via its own alert/error
      // state; the composer just leaves the text in place so nothing is lost.
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  return (
    <form className="composer" onSubmit={handleSubmit}>
      <textarea
        className="composer-input"
        rows={1}
        placeholder="Type a message…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button type="submit" className="composer-send" disabled={!text.trim() || sending} aria-label="Send message">
        <IconSend size={18} />
      </button>

      <style>{`
        .composer { display: flex; align-items: flex-end; gap: 10px; padding: var(--space-md) var(--space-lg); border-top: 1px solid var(--color-neutral-100); background: white; }
        .composer-input { flex: 1; resize: none; border: 1px solid var(--color-neutral-200); border-radius: var(--radius-lg); padding: 10px 14px; font-size: var(--font-size-sm); font-family: inherit; max-height: 120px; }
        .composer-input:focus { outline: none; border-color: var(--color-primary-400); }
        .composer-send { width: 40px; height: 40px; border-radius: 50%; border: none; background: var(--color-primary-600); color: white; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; transition: background var(--transition-base); }
        .composer-send:hover:not(:disabled) { background: var(--color-primary-700); }
        .composer-send:disabled { background: var(--color-neutral-200); cursor: default; }
      `}</style>
    </form>
  );
}
