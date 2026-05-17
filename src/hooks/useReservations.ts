import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useOfflineData } from '@/hooks/useOfflineData';
import { useOfflineInsert, useOfflineUpdate, useOfflineDelete } from '@/hooks/useOfflineMutation';
import { toast } from 'sonner';

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
  const { user } = useAuth();
  const [outletId, setOutletId] = useState<string | null>(null);

  // Fetch outlet on mount
  useState(() => {
    if (user) {
      supabase
        .from('profiles')
        .select('selected_outlet_id')
        .eq('id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          setOutletId(data?.selected_outlet_id || null);
        });
    }
  });

  const { data: reservations, isLoading: loading, refetch: fetchReservations } = useOfflineData<Reservation>({
    table: 'reservations',
    queryKey: ['reservations'],
    enabled: !!user && !!outletId,
    buildQuery: async (userId, outlet) => {
      const { data, error } = await supabase
        .from('reservations')
        .select('id, user_id, customer_name, customer_email, customer_phone, reservation_date, reservation_time, party_size, status, table_number, special_requests, created_at, updated_at')
        .eq('user_id', userId)
        .eq('outlet_id', outlet || '')
        .order('reservation_date', { ascending: true })
        .order('reservation_time', { ascending: true })
        .limit(200);
      return { data: (data || []) as Reservation[], error };
    },
  });

  const insertMutation = useOfflineInsert({
    table: 'reservations',
    queryKey: ['reservations'],
    onSuccess: () => {
      toast.success("Succès", { description: "Réservation créée avec succès" });
    },
  });

  const updateMutation = useOfflineUpdate({
    table: 'reservations',
    queryKey: ['reservations'],
    onSuccess: () => {
      toast.success("Succès", { description: "Réservation mise à jour" });
    },
  });

  const deleteMutation = useOfflineDelete({
    table: 'reservations',
    queryKey: ['reservations'],
    onSuccess: () => {
      toast.success("Succès", { description: "Réservation supprimée avec succès" });
    },
  });

  const createReservation = useCallback(async (reservationData: Omit<Reservation, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return false;

    if (!outletId) {
      toast.error("Erreur", { description: "Aucun point de vente sélectionné" });
      return false;
    }
    
    insertMutation.mutate({
      ...reservationData,
      user_id: user.id,
      outlet_id: outletId,
    } as unknown as Record<string, unknown>);
    return true;
  }, [user, outletId, toast, insertMutation]);

  const updateReservation = useCallback(async (id: string, updates: Partial<Reservation>) => {
    if (!user) return false;
    updateMutation.mutate({ id, ...updates } as unknown as Record<string, unknown> & { id: string });
    return true;
  }, [user, updateMutation]);

  const deleteReservation = useCallback(async (id: string) => {
    if (!user) return false;
    deleteMutation.mutate(id);
    return true;
  }, [user, deleteMutation]);

  const getReservationStats = useCallback(() => {
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
  }, [reservations]);

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
