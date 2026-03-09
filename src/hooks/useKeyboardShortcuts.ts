import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface ShortcutConfig {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts() {
  const navigate = useNavigate();

  const shortcuts: ShortcutConfig[] = [
    { key: 'd', altKey: true, action: () => navigate('/dashboard'), description: 'Dashboard' },
    { key: 'c', altKey: true, action: () => navigate('/commandes'), description: 'Commandes' },
    { key: 't', altKey: true, action: () => navigate('/tables'), description: 'Tables' },
    { key: 'f', altKey: true, action: () => navigate('/factures'), description: 'Factures' },
    { key: 'm', altKey: true, action: () => navigate('/menus'), description: 'Menus' },
    { key: 'i', altKey: true, action: () => navigate('/inventaire'), description: 'Inventaire' },
    { key: 's', altKey: true, action: () => navigate('/statistiques'), description: 'Statistiques' },
    { key: 'p', altKey: true, action: () => navigate('/parametres'), description: 'Paramètres' },
  ];

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;

    for (const shortcut of shortcuts) {
      const ctrlMatch = shortcut.ctrlKey ? (event.ctrlKey || event.metaKey) : true;
      const altMatch = shortcut.altKey ? event.altKey : !event.altKey;
      const shiftMatch = shortcut.shiftKey ? event.shiftKey : !event.shiftKey;
      
      if (event.key.toLowerCase() === shortcut.key && ctrlMatch && altMatch && shiftMatch) {
        event.preventDefault();
        shortcut.action();
        break;
      }
    }
  }, [shortcuts]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return { shortcuts };
}
