import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface ShortcutConfig {
  key: string;
  altKey?: boolean;
  ctrlKey?: boolean;
  path: string;
  label: string;
}

const SHORTCUTS: ShortcutConfig[] = [
  { key: 'd', altKey: true, path: '/dashboard', label: 'Dashboard' },
  { key: 'c', altKey: true, path: '/commandes', label: 'Commandes' },
  { key: 't', altKey: true, path: '/tables', label: 'Tables' },
  { key: 'm', altKey: true, path: '/menus', label: 'Menus' },
  { key: 'f', altKey: true, path: '/factures', label: 'Factures' },
  { key: 'i', altKey: true, path: '/inventaire', label: 'Inventaire' },
  { key: 'k', altKey: true, path: '/comptabilite', label: 'Comptabilité' },
  { key: 's', altKey: true, path: '/statistiques', label: 'Statistiques' },
  { key: 'e', altKey: true, path: '/equipe', label: 'Équipe' },
  { key: 'p', altKey: true, path: '/parametres', label: 'Paramètres' },
];

export function useKeyboardShortcuts() {
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't fire when typing in inputs
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        return;
      }

      for (const shortcut of SHORTCUTS) {
        const altMatch = shortcut.altKey ? e.altKey : !e.altKey;
        const ctrlMatch = shortcut.ctrlKey ? e.ctrlKey : !e.ctrlKey;

        if (e.key.toLowerCase() === shortcut.key && altMatch && ctrlMatch) {
          e.preventDefault();
          navigate(shortcut.path);
          return;
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate]);

  return SHORTCUTS;
}
