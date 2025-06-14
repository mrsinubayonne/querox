
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Event {
  id: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  location: string;
  capacity: number;
  registered: number;
  status: 'Ouvert' | 'En cours' | 'Confirmé' | 'Complet' | 'Annulé';
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
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching events:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les événements",
          variant: "destructive",
        });
      } else {
        setEvents(data || []);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const addEvent = async (eventData: Omit<Event, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'registered'>) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('events')
        .insert([{
          ...eventData,
          user_id: user.id,
          registered: 0
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding event:', error);
        toast({
          title: "Erreur",
          description: "Impossible d'ajouter l'événement",
          variant: "destructive",
        });
        return false;
      } else {
        setEvents(prev => [...prev, data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
        toast({
          title: "Succès",
          description: "Événement ajouté avec succès",
        });
        return true;
      }
    } catch (error) {
      console.error('Error adding event:', error);
      return false;
    }
  };

  const updateEvent = async (id: string, updates: Partial<Event>) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('events')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating event:', error);
        toast({
          title: "Erreur",
          description: "Impossible de modifier l'événement",
          variant: "destructive",
        });
        return false;
      } else {
        setEvents(prev => prev.map(event => 
          event.id === id ? data : event
        ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
        toast({
          title: "Succès",
          description: "Événement modifié avec succès",
        });
        return true;
      }
    } catch (error) {
      console.error('Error updating event:', error);
      return false;
    }
  };

  const deleteEvent = async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting event:', error);
        toast({
          title: "Erreur",
          description: "Impossible de supprimer l'événement",
          variant: "destructive",
        });
        return false;
      } else {
        setEvents(prev => prev.filter(event => event.id !== id));
        toast({
          title: "Succès",
          description: "Événement supprimé avec succès",
        });
        return true;
      }
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
