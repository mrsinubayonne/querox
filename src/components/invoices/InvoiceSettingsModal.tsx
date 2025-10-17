import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface InvoiceSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const InvoiceSettingsModal: React.FC<InvoiceSettingsModalProps> = ({
  open,
  onOpenChange
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    company_name: '',
    company_address: '',
    company_phone: '',
    company_email: '',
    invoice_notes: '',
    primary_color: '#3B82F6',
    logo_url: ''
  });

  useEffect(() => {
    if (open && user) {
      fetchSettings();
    }
  }, [open, user]);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('websites')
        .select('name, logo_url, primary_color, address, phone, email')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings({
          company_name: data.name || '',
          company_address: data.address || '',
          company_phone: data.phone || '',
          company_email: data.email || '',
          invoice_notes: '',
          primary_color: data.primary_color || '#3B82F6',
          logo_url: data.logo_url || ''
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('websites')
        .update({
          name: settings.company_name,
          address: settings.company_address,
          phone: settings.company_phone,
          email: settings.company_email,
          primary_color: settings.primary_color,
          logo_url: settings.logo_url,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Paramètres sauvegardés",
        description: "Vos paramètres de facturation ont été mis à jour"
      });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Personnalisation des factures</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Nom de l'entreprise *</Label>
            <Input
              value={settings.company_name}
              onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
              placeholder="Mon Restaurant"
            />
          </div>

          <div className="space-y-2">
            <Label>Adresse</Label>
            <Input
              value={settings.company_address}
              onChange={(e) => setSettings({ ...settings, company_address: e.target.value })}
              placeholder="123 Rue Example, Ville"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Téléphone</Label>
              <Input
                value={settings.company_phone}
                onChange={(e) => setSettings({ ...settings, company_phone: e.target.value })}
                placeholder="+242 XX XXX XXXX"
              />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={settings.company_email}
                onChange={(e) => setSettings({ ...settings, company_email: e.target.value })}
                placeholder="contact@restaurant.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Couleur principale</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={settings.primary_color}
                onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                className="w-20 h-10"
              />
              <Input
                value={settings.primary_color}
                onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                placeholder="#3B82F6"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>URL du logo</Label>
            <Input
              value={settings.logo_url}
              onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <Label>Notes par défaut (optionnel)</Label>
            <Textarea
              value={settings.invoice_notes}
              onChange={(e) => setSettings({ ...settings, invoice_notes: e.target.value })}
              placeholder="Conditions de paiement, informations bancaires..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enregistrer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
