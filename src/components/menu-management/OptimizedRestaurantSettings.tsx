
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Save, Store } from 'lucide-react';

interface RestaurantSettings {
  restaurant_name: string;
  currency: string;
  language: string;
  timezone: string;
}

const OptimizedRestaurantSettings: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [settings, setSettings] = useState<RestaurantSettings>({
    restaurant_name: 'Mon Restaurant',
    currency: 'FCFA',
    language: 'fr',
    timezone: 'Africa/Dakar',
  });

  const fetchSettings = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileError);
        return;
      }

      if (profile) {
        setSettings({
          restaurant_name: profile.full_name || 'Mon Restaurant',
          currency: 'FCFA',
          language: 'fr',
          timezone: 'Africa/Dakar',
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!user) return;

    try {
      setSaving(true);

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: settings.restaurant_name,
          email: user.email,
          updated_at: new Date().toISOString(),
        });

      if (profileError) {
        throw profileError;
      }

      toast({
        title: "Succès",
        description: "Paramètres sauvegardés avec succès",
      });
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [user]);

  const handleInputChange = (field: keyof RestaurantSettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Store className="h-5 w-5 text-emerald-500" />
          <div>
            <CardTitle>Informations générales</CardTitle>
            <CardDescription>Configurez les informations de base de votre restaurant</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="restaurant-name">
            Nom du restaurant
          </Label>
          <Input
            id="restaurant-name"
            value={settings.restaurant_name}
            onChange={(e) => handleInputChange('restaurant_name', e.target.value)}
            placeholder="Entrez le nom de votre restaurant"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="currency">
            Devise
          </Label>
          <Select 
            value={settings.currency} 
            onValueChange={(value) => handleInputChange('currency', value)}
          >
            <SelectTrigger id="currency">
              <SelectValue placeholder="Sélectionner une devise" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="FCFA">Franc CFA (FCFA)</SelectItem>
              <SelectItem value="EUR">Euro (€)</SelectItem>
              <SelectItem value="USD">Dollar américain ($)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="language">
            Langue
          </Label>
          <Select 
            value={settings.language} 
            onValueChange={(value) => handleInputChange('language', value)}
          >
            <SelectTrigger id="language">
              <SelectValue placeholder="Sélectionner une langue" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fr">Français</SelectItem>
              <SelectItem value="en">Anglais</SelectItem>
              <SelectItem value="es">Espagnol</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="timezone">
            Fuseau horaire
          </Label>
          <Select 
            value={settings.timezone} 
            onValueChange={(value) => handleInputChange('timezone', value)}
          >
            <SelectTrigger id="timezone">
              <SelectValue placeholder="Sélectionner un fuseau horaire" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Africa/Dakar">Dakar (GMT+0)</SelectItem>
              <SelectItem value="Africa/Casablanca">Casablanca (GMT+1)</SelectItem>
              <SelectItem value="Europe/Paris">Paris (GMT+2)</SelectItem>
              <SelectItem value="America/New_York">New York (GMT-4)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="pt-4">
          <Button 
            onClick={saveSettings} 
            disabled={saving}
            className="w-full"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sauvegarde...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default OptimizedRestaurantSettings;
