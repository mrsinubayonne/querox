
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Reservation {
  id: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  date: string;
  time: string;
  party_size: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export const useReservations = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReservations = async () => {
    if (!user) {
      setReservations([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching reservations:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les réservations",
          variant: "destructive",
        });
      } else {
        setReservations(data || []);
      }
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const addReservation = async (reservationData: Omit<Reservation, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('reservations')
        .insert([{
          ...reservationData,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding reservation:', error);
        toast({
          title: "Erreur",
          description: "Impossible d'ajouter la réservation",
          variant: "destructive",
        });
        return false;
      } else {
        setReservations(prev => [...prev, data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
        toast({
          title: "Succès",
          description: "Réservation ajoutée avec succès",
        });
        return true;
      }
    } catch (error) {
      console.error('Error adding reservation:', error);
      return false;
    }
  };

  const updateReservation = async (id: string, updates: Partial<Reservation>) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('reservations')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating reservation:', error);
        toast({
          title: "Erreur",
          description: "Impossible de modifier la réservation",
          variant: "destructive",
        });
        return false;
      } else {
        setReservations(prev => prev.map(reservation => 
          reservation.id === id ? data : reservation
        ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
        toast({
          title: "Succès",
          description: "Réservation modifiée avec succès",
        });
        return true;
      }
    } catch (error) {
      console.error('Error updating reservation:', error);
      return false;
    }
  };

  const deleteReservation = async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('reservations')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting reservation:', error);
        toast({
          title: "Erreur",
          description: "Impossible de supprimer la réservation",
          variant: "destructive",
        });
        return false;
      } else {
        setReservations(prev => prev.filter(reservation => reservation.id !== id));
        toast({
          title: "Succès",
          description: "Réservation supprimée avec succès",
        });
        return true;
      }
    } catch (error) {
      console.error('Error deleting reservation:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [user]);

  return {
    reservations,
    loading,
    addReservation,
    updateReservation,
    deleteReservation,
    refetch: fetchReservations,
  };
};
