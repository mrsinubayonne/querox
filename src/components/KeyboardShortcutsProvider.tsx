import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

/**
 * Invisible component that registers global keyboard shortcuts.
 * Must be rendered inside a Router context.
 */
export const KeyboardShortcutsProvider = () => {
  useKeyboardShortcuts();
  return null;
};
