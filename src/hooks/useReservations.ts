import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Reservation {
  id: string;
  user_id: string;
  customer_name: string;
  customer_email?: string;
  customer_phone: string;
  reservation_date: string;
  reservation_time: string;
  party_size: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  table_number?: string;
  special_requests?: string;
  created_at: string;
  updated_at: string;
}

export const useReservations = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchReservations = async () => {
    if (!user) {
      setReservations([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .order('reservation_date', { ascending: true })
        .order('reservation_time', { ascending: true });

      if (error) throw error;
      setReservations((data || []) as Reservation[]);
    } catch (error: any) {
      console.error('Reservations fetch error:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les réservations",
        variant: "destructive"
      });
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  const createReservation = async (reservationData: Omit<Reservation, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('reservations')
        .insert({ ...reservationData, user_id: user.id })
        .select()
        .single();

      if (error) throw error;

      setReservations(prev => [...prev, data as Reservation]);
      toast({
        title: "Succès",
        description: "Réservation créée avec succès"
      });

      return data;
    } catch (error: any) {
      console.error('Reservation creation error:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la réservation",
        variant: "destructive"
      });
      return false;
    }
  };

  const updateReservation = async (id: string, updates: Partial<Reservation>) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('reservations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setReservations(prev => prev.map(r => r.id === id ? data as Reservation : r));
      toast({
        title: "Succès",
        description: "Réservation mise à jour"
      });
      return data;
    } catch (error: any) {
      console.error('Update error:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la réservation",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteReservation = async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('reservations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setReservations(prev => prev.filter(r => r.id !== id));
      toast({
        title: "Succès",
        description: "Réservation supprimée avec succès"
      });
      return true;
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la réservation",
        variant: "destructive"
      });
      return false;
    }
  };

  const getReservationStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayReservations = reservations.filter(r => r.reservation_date === today);
    
    const thisWeekStart = new Date();
    thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
    const thisWeekEnd = new Date(thisWeekStart);
    thisWeekEnd.setDate(thisWeekEnd.getDate() + 6);
    
    const weekReservations = reservations.filter(r => {
      const resDate = new Date(r.reservation_date);
      return resDate >= thisWeekStart && resDate <= thisWeekEnd;
    });

    const thisMonth = new Date().getMonth();
    const monthReservations = reservations.filter(r => 
      new Date(r.reservation_date).getMonth() === thisMonth
    );

    const totalGuests = monthReservations.reduce((sum, r) => sum + r.party_size, 0);

    return {
      todayCount: todayReservations.length,
      weekCount: weekReservations.length,
      monthGuestsCount: totalGuests,
      confirmedRate: Math.round((reservations.filter(r => r.status === 'confirmed').length / (reservations.length || 1)) * 100)
    };
  };

  useEffect(() => {
    fetchReservations();

    const channel = supabase
      .channel('reservations-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'reservations' },
        () => fetchReservations()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    reservations,
    loading,
    fetchReservations,
    createReservation,
    updateReservation,
    deleteReservation,
    getReservationStats
  };
};
