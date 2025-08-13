
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface AdminSubscription {
  id: string;
  user_id: string | null;
  email: string;
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
}

export const useAdminSubscription = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if current user is admin using the new role system
  const checkAdminStatus = async () => {
    if (!user) {
      setIsAdmin(false);
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        return false;
      }

      const adminStatus = !!data;
      setIsAdmin(adminStatus);
      return adminStatus;
    } catch (error) {
      console.error('Error in checkAdminStatus:', error);
      setIsAdmin(false);
      return false;
    }
  };

  const fetchSubscriptions = async () => {
    const adminStatus = await checkAdminStatus();
    
    if (!adminStatus) {
      setSubscriptions([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('subscribers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching subscriptions:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les abonnements",
          variant: "destructive",
        });
        return;
      }

      setSubscriptions(data || []);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du chargement",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSubscription = async (id: string, updates: Partial<AdminSubscription>) => {
    if (!isAdmin) {
      toast({
        title: "Erreur",
        description: "Accès non autorisé",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('subscribers')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating subscription:', error);
        toast({
          title: "Erreur",
          description: "Impossible de mettre à jour l'abonnement",
          variant: "destructive",
        });
        return false;
      }

      // Update local state
      setSubscriptions(prev => 
        prev.map(sub => 
          sub.id === id ? { ...sub, ...updates } : sub
        )
      );

      toast({
        title: "Succès",
        description: "Abonnement mis à jour avec succès",
      });

      return true;
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      });
      return false;
    }
  };

  const createSubscription = async (subscriptionData: Omit<AdminSubscription, 'id' | 'created_at' | 'updated_at'>) => {
    if (!isAdmin) {
      toast({
        title: "Erreur",
        description: "Accès non autorisé",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('subscribers')
        .insert(subscriptionData)
        .select()
        .single();

      if (error) {
        console.error('Error creating subscription:', error);
        toast({
          title: "Erreur",
          description: "Impossible de créer l'abonnement",
          variant: "destructive",
        });
        return false;
      }

      setSubscriptions(prev => [data, ...prev]);
      toast({
        title: "Succès",
        description: "Abonnement créé avec succès",
      });

      return true;
    } catch (error) {
      console.error('Error creating subscription:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteSubscription = async (id: string) => {
    if (!isAdmin) {
      toast({
        title: "Erreur",
        description: "Accès non autorisé",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('subscribers')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting subscription:', error);
        toast({
          title: "Erreur",
          description: "Impossible de supprimer l'abonnement",
          variant: "destructive",
        });
        return false;
      }

      setSubscriptions(prev => prev.filter(sub => sub.id !== id));
      toast({
        title: "Succès",
        description: "Abonnement supprimé avec succès",
      });

      return true;
    } catch (error) {
      console.error('Error deleting subscription:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [user]);

  return {
    subscriptions,
    loading,
    isAdmin,
    updateSubscription,
    createSubscription,
    deleteSubscription,
    refetch: fetchSubscriptions,
  };
};
