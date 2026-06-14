/**
 * Dev-mode keyboard shortcut: Ctrl+Enter to send the current chat message.
 *
 * In dev mode with ENABLE_MOCK_DEV_USER, the @lobehub/editor's SendButton may
 * not render reliably because the editor's Lexical store and the zustand store
 * can become out of sync. This hook adds a global keyboard listener as a
 * fallback so the developer can always send messages.
 */
import { useEffect } from 'react';

const isDev = typeof __DEV__ !== 'undefined' && __DEV__;

/**
 * Global dev-mode send dispatcher that the ChatInput store registers itself
 * with so the keyboard listener can call it even across React tree boundaries.
 */
export const devSendDispatcher: { current: (() => void) | null } = { current: null };

export function useDevSendHotkey(): void {
  useEffect(() => {
    if (!isDev) return;

    const handler = (e: KeyboardEvent) => {
      // Only intercept when focus is in the chat editor (contenteditable)
      const active = document.activeElement;
      if (!active || active.getAttribute('contenteditable') !== 'true') return;

      // Ctrl+Enter or Meta+Enter to send
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        devSendDispatcher.current?.();
      }
    };

    document.addEventListener('keydown', handler, { capture: true });
    return () => document.removeEventListener('keydown', handler, { capture: true });
  }, []);
}
