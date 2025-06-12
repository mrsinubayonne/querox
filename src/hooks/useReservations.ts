
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
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
}

export const useReservations = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchReservations = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      setReservations(data || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les réservations",
        variant: "destructive"
      });
    }
  };

  const createReservation = async (reservationData: Partial<Reservation>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('reservations')
        .insert([{ ...reservationData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      
      setReservations(prev => [...prev, data]);
      toast({
        title: "Succès",
        description: "Réservation créée avec succès"
      });
      
      return data;
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de créer la réservation",
        variant: "destructive"
      });
    }
  };

  const updateReservationStatus = async (reservationId: string, status: Reservation['status']) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('reservations')
        .update({ status })
        .eq('id', reservationId);

      if (error) throw error;
      
      setReservations(prev => 
        prev.map(res => 
          res.id === reservationId ? { ...res, status } : res
        )
      );
      
      toast({
        title: "Succès",
        description: "Statut mis à jour avec succès"
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive"
      });
    }
  };

  const getTodayReservations = () => {
    const today = new Date().toISOString().split('T')[0];
    return reservations.filter(res => res.date === today);
  };

  const getUpcomingReservations = () => {
    const today = new Date().toISOString().split('T')[0];
    return reservations.filter(res => res.date >= today && res.status !== 'cancelled');
  };

  useEffect(() => {
    if (user) {
      setLoading(true);
      fetchReservations().finally(() => setLoading(false));
    }
  }, [user]);

  return {
    reservations,
    loading,
    fetchReservations,
    createReservation,
    updateReservationStatus,
    getTodayReservations,
    getUpcomingReservations
  };
};
