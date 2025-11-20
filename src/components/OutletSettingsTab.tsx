import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Store } from 'lucide-react';

export const OutletSettingsTab: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [outletId, setOutletId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: ''
  });

  useEffect(() => {
    fetchOutletSettings();
  }, [user]);

  const fetchOutletSettings = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Get selected outlet
      const selectedProfileId = localStorage.getItem('selectedProfileId');
      let selectedOutletId: string | null = null;
      
      if (selectedProfileId) {
        const { data: userProfile } = await supabase
          .from('user_profiles')
          .select('selected_outlet_id')
          .eq('id', selectedProfileId)
          .maybeSingle();
        selectedOutletId = userProfile?.selected_outlet_id ?? null;
      } else {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('selected_outlet_id')
          .eq('user_id', user.id)
          .maybeSingle();
        selectedOutletId = profile?.selected_outlet_id ?? null;
      }

      if (!selectedOutletId) {
        toast({
          title: "Erreur",
          description: "Aucun point de vente sélectionné",
          variant: "destructive"
        });
        return;
      }

      setOutletId(selectedOutletId);

      // Fetch outlet data
      const { data: outlet, error } = await supabase
        .from('outlets')
        .select('*')
        .eq('id', selectedOutletId)
        .single();

      if (error) throw error;

      if (outlet) {
        setFormData({
          name: outlet.name || '',
          address: outlet.address || '',
          phone: outlet.phone || ''
        });
      }
    } catch (error: any) {
      console.error('Error fetching outlet settings:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les paramètres du point de vente",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!outletId) {
      toast({
        title: "Erreur",
        description: "Aucun point de vente sélectionné",
        variant: "destructive"
      });
      return;
    }

    try {
      setSaving(true);

      const { error } = await supabase
        .from('outlets')
        .update({
          name: formData.name,
          address: formData.address,
          phone: formData.phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', outletId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Les paramètres du point de vente ont été mis à jour"
      });
    } catch (error: any) {
      console.error('Error updating outlet settings:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour les paramètres",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Store className="h-5 w-5 text-primary" />
            <CardTitle>Informations du Point de Vente</CardTitle>
          </div>
          <CardDescription>
            Gérez les informations de votre point de vente actuel
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom du point de vente *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Restaurant Principal"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Adresse</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="123 Rue Example, Paris"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+33 1 23 45 67 89"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Enregistrer les modifications
        </Button>
      </div>
    </form>
  );
};
