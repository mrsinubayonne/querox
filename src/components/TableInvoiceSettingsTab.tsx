import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Save, Loader2 } from 'lucide-react';
import LogoUpload from './LogoUpload';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const TableInvoiceSettingsTab: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settingsId, setSettingsId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    invoice_title: 'FACTURE',
    company_name: '',
    company_address: '',
    company_phone: '',
    company_email: '',
    tax_id: '',
    payment_terms: 'Paiement à effectuer sous 30 jours à compter de la date de facturation.',
    footer_note: '',
    logo_url: '',
    primary_color: '#3B82F6',
  });

  useEffect(() => {
    fetchSettings();
  }, [user]);

  const fetchSettings = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Récupérer les paramètres spécifiques aux tables (outlet_id = 'TABLES_SETTINGS')
      const { data, error } = await supabase
        .from('invoice_settings')
        .select('*')
        .eq('user_id', user.id)
        .eq('outlet_id', 'TABLES_SETTINGS')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setSettingsId(data.id);
        setFormData({
          invoice_title: data.invoice_title || 'FACTURE',
          company_name: data.company_name || '',
          company_address: data.company_address || '',
          company_phone: data.company_phone || '',
          company_email: data.company_email || '',
          tax_id: data.tax_id || '',
          payment_terms: data.payment_terms || 'Paiement à effectuer sous 30 jours à compter de la date de facturation.',
          footer_note: data.footer_note || '',
          logo_url: typeof data.logo_url === 'string' ? data.logo_url : (data.logo_url as any)?.value || '',
          primary_color: data.primary_color || '#3B82F6',
        });
      }
    } catch (error: any) {
      console.error('Error fetching table invoice settings:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les paramètres d\'impression',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      // S'assurer que le logo est stocké comme simple chaîne
      const sanitizedData = { ...formData };
      if (sanitizedData.logo_url && typeof sanitizedData.logo_url === 'object' && (sanitizedData.logo_url as any).value) {
        sanitizedData.logo_url = (sanitizedData.logo_url as any).value;
      }

      if (settingsId) {
        // Mettre à jour les paramètres existants
        const { error } = await supabase
          .from('invoice_settings')
          .update({
            ...sanitizedData,
            updated_at: new Date().toISOString()
          })
          .eq('id', settingsId);

        if (error) throw error;
      } else {
        // Créer de nouveaux paramètres avec outlet_id spécial pour les tables
        const { data, error } = await supabase
          .from('invoice_settings')
          .insert({
            user_id: user.id,
            outlet_id: 'TABLES_SETTINGS',
            ...sanitizedData,
          })
          .select()
          .single();

        if (error) throw error;
        setSettingsId(data.id);
      }

      toast({
        title: 'Succès',
        description: 'Paramètres d\'impression sauvegardés',
      });
    } catch (error: any) {
      console.error('Error saving table invoice settings:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de sauvegarder les paramètres',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <CardTitle>Paramètres d'impression pour les Tables</CardTitle>
            </div>
            <CardDescription>
              Ces paramètres sont utilisés uniquement pour les impressions depuis la section Tables
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* En-tête de facture */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">En-tête de facture</h3>
              
              <div className="space-y-2">
                <Label htmlFor="invoice_title">Titre de la facture</Label>
                <Input
                  id="invoice_title"
                  value={formData.invoice_title}
                  onChange={(e) => handleChange('invoice_title', e.target.value)}
                  placeholder="FACTURE"
                />
              </div>

              <div className="space-y-2">
                <Label>Logo</Label>
                <LogoUpload
                  currentLogo={formData.logo_url}
                  onLogoChange={(url) => handleChange('logo_url', url)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_name">Nom de l'entreprise</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => handleChange('company_name', e.target.value)}
                  placeholder="Mon Restaurant"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_address">Adresse</Label>
                <Textarea
                  id="company_address"
                  value={formData.company_address}
                  onChange={(e) => handleChange('company_address', e.target.value)}
                  placeholder="123 Rue Example, 75001 Paris"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company_phone">Téléphone</Label>
                  <Input
                    id="company_phone"
                    value={formData.company_phone}
                    onChange={(e) => handleChange('company_phone', e.target.value)}
                    placeholder="+33 1 23 45 67 89"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company_email">Email</Label>
                  <Input
                    id="company_email"
                    type="email"
                    value={formData.company_email}
                    onChange={(e) => handleChange('company_email', e.target.value)}
                    placeholder="contact@restaurant.fr"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tax_id">N° SIRET / TVA</Label>
                <Input
                  id="tax_id"
                  value={formData.tax_id}
                  onChange={(e) => handleChange('tax_id', e.target.value)}
                  placeholder="123 456 789 00012"
                />
              </div>
            </div>

            {/* Conditions de paiement */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Conditions de paiement</h3>
              <div className="space-y-2">
                <Label htmlFor="payment_terms">Conditions</Label>
                <Textarea
                  id="payment_terms"
                  value={formData.payment_terms}
                  onChange={(e) => handleChange('payment_terms', e.target.value)}
                  rows={2}
                />
              </div>
            </div>

            {/* Note de pied de page */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Note de pied de page</h3>
              <div className="space-y-2">
                <Label htmlFor="footer_note">Note (optionnel)</Label>
                <Textarea
                  id="footer_note"
                  value={formData.footer_note}
                  onChange={(e) => handleChange('footer_note', e.target.value)}
                  placeholder="Merci pour votre visite!"
                  rows={2}
                />
              </div>
            </div>

            {/* Couleur principale */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Apparence</h3>
              <div className="space-y-2">
                <Label htmlFor="primary_color">Couleur principale</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="primary_color"
                    type="color"
                    value={formData.primary_color}
                    onChange={(e) => handleChange('primary_color', e.target.value)}
                    className="w-20 h-10"
                  />
                  <Input
                    value={formData.primary_color}
                    onChange={(e) => handleChange('primary_color', e.target.value)}
                    placeholder="#3B82F6"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={saving} className="w-full">
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Enregistrement...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Enregistrer les paramètres
            </>
          )}
        </Button>
      </form>
    </div>
  );
};
