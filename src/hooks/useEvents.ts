import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useOfflineData } from '@/hooks/useOfflineData';
import { useOfflineInsert, useOfflineUpdate, useOfflineDelete } from '@/hooks/useOfflineMutation';

interface Event {
  id: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  location: string;
  capacity: number;
  registered: number;
  status: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export const useEvents = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: events, isLoading: loading, refetch } = useOfflineData<Event>({
    table: 'events',
    queryKey: ['events'],
    enabled: !!user,
    buildQuery: async (userId) => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: true });
      return { data: (data || []) as Event[], error };
    },
  });

  const insertMutation = useOfflineInsert({
    table: 'events',
    queryKey: ['events'],
    onSuccess: () => {
      toast({
        title: "Succès",
        description: "Événement ajouté avec succès",
      });
    },
  });

  const updateMutation = useOfflineUpdate({
    table: 'events',
    queryKey: ['events'],
    onSuccess: () => {
      toast({
        title: "Succès",
        description: "Événement modifié avec succès",
      });
    },
  });

  const deleteMutation = useOfflineDelete({
    table: 'events',
    queryKey: ['events'],
    onSuccess: () => {
      toast({
        title: "Succès",
        description: "Événement supprimé avec succès",
      });
    },
  });

  const addEvent = useCallback(async (eventData: Omit<Event, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'registered'>) => {
    if (!user) return false;
    
    insertMutation.mutate({
      ...eventData,
      user_id: user.id,
      registered: 0
    } as unknown as Record<string, unknown>);
    
    return true;
  }, [user, insertMutation]);

  const updateEvent = useCallback(async (id: string, updates: Partial<Event>) => {
    if (!user) return false;

    updateMutation.mutate({
      id,
      ...updates,
      updated_at: new Date().toISOString()
    } as unknown as Record<string, unknown> & { id: string });
    
    return true;
  }, [user, updateMutation]);

  const deleteEvent = useCallback(async (id: string) => {
    if (!user) return false;

    deleteMutation.mutate(id);
    return true;
  }, [user, deleteMutation]);

  return {
    events,
    loading,
    addEvent,
    updateEvent,
    deleteEvent,
    refetch,
  };
};
