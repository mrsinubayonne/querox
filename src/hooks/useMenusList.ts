
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface MenuInfo {
  id: string;
  name: string;
}

export const useMenusList = () => {
  const { user } = useAuth();
  const [menus, setMenus] = useState<MenuInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMenus = useCallback(async () => {
    if (!user) {
      setMenus([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('menus')
        .select('id, name')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching menus list:', error);
        setMenus([]);
      } else {
        setMenus(data || []);
      }
    } catch (error) {
      console.error('Error fetching menus list:', error);
      setMenus([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  return { menus, loading, refetch: fetchMenus };
};
