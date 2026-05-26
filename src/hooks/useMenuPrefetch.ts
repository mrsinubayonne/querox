import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useInternalMenuItems } from '@/hooks/useInternalMenuItems';

/**
 * Mounts once at app root to warm the menu items memory cache as soon as the user is authenticated.
 * The Tables POS modals then open instantly because `useInternalMenuItems` reads from the same in-memory cache.
 */
export const useMenuPrefetch = () => {
  const { user } = useAuth();
  // Triggers the fetch when `isActive` becomes true.
  useInternalMenuItems(!!user);
};
