
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { dataService } from '@/services/DataService';

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
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    if (!user) {
      setEvents([]);
      setLoading(false);
      return;
    }

    try {
      const data = await dataService.getAll<Event>('events', { user_id: user.id });
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const addEvent = async (eventData: Omit<Event, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'registered'>) => {
    if (!user) return false;

    try {
      await dataService.create<Event>('events', {
        ...eventData,
        user_id: user.id,
        registered: 0
      });

      toast({
        title: "Succès",
        description: "Événement ajouté avec succès",
      });

      await fetchEvents();
      return true;
    } catch (error) {
      console.error('Error adding event:', error);
      return false;
    }
  };

  const updateEvent = async (id: string, updates: Partial<Event>) => {
    if (!user) return false;

    try {
      await dataService.update<Event>('events', id, {
        ...updates,
        updated_at: new Date().toISOString()
      });

      toast({
        title: "Succès",
        description: "Événement modifié avec succès",
      });

      await fetchEvents();
      return true;
    } catch (error) {
      console.error('Error updating event:', error);
      return false;
    }
  };

  const deleteEvent = async (id: string) => {
    if (!user) return false;

    try {
      await dataService.delete('events', id);

      toast({
        title: "Succès",
        description: "Événement supprimé avec succès",
      });

      await fetchEvents();
      return true;
    } catch (error) {
      console.error('Error deleting event:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [user]);

  return {
    events,
    loading,
    addEvent,
    updateEvent,
    deleteEvent,
    refetch: fetchEvents,
  };
};
