import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Save, Loader2, Eye } from 'lucide-react';
import LogoUpload from './LogoUpload';
import InvoicePreview from './invoices/InvoicePreview';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const InvoiceSettingsTab: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [selectedOutletId, setSelectedOutletId] = useState<string | null>(null);
  
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

  const getSelectedOutletId = async () => {
    if (!user) return null;

    const selectedProfileId = localStorage.getItem('selectedProfileId');
    let outletId: string | null = null;

    if (selectedProfileId) {
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('selected_outlet_id')
        .eq('id', selectedProfileId)
        .maybeSingle();
      outletId = userProfile?.selected_outlet_id ?? null;
    } else {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('selected_outlet_id')
        .eq('user_id', user.id)
        .maybeSingle();
      outletId = profile?.selected_outlet_id ?? null;
    }

    setSelectedOutletId(outletId);
    return outletId;
  };

  const fetchSettings = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const outletId = await getSelectedOutletId();
      
      if (!outletId) {
        console.log('No outlet selected');
        setLoading(false);
        return;
      }

      // Récupérer les paramètres de facture pour ce PDV
      const { data, error } = await supabase
        .from('invoice_settings')
        .select('*')
        .eq('user_id', user.id)
        .eq('outlet_id', outletId)
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
      console.error('Error fetching invoice settings:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les paramètres de facturation',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const outletId = selectedOutletId || await getSelectedOutletId();
    
    if (!outletId) {
      toast({
        title: 'Erreur',
        description: 'Aucun point de vente sélectionné',
        variant: 'destructive',
      });
      return;
    }

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
        // Créer de nouveaux paramètres pour ce PDV
        const { data, error } = await supabase
          .from('invoice_settings')
          .insert({
            user_id: user.id,
            outlet_id: outletId,
            ...sanitizedData,
          })
          .select()
          .single();

        if (error) throw error;
        if (data) setSettingsId(data.id);
      }

      toast({
        title: 'Succès',
        description: 'Paramètres de facturation enregistrés pour ce point de vente',
      });
      
      await fetchSettings();
    } catch (error: any) {
      console.error('Error saving invoice settings:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'enregistrer les paramètres',
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
      <Tabs defaultValue="edit" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="edit">
            <FileText className="w-4 h-4 mr-2" />
            Modifier
          </TabsTrigger>
          <TabsTrigger value="preview">
            <Eye className="w-4 h-4 mr-2" />
            Aperçu en temps réel
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="edit">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <CardTitle>Configuration des factures</CardTitle>
          </div>
          <CardDescription>
            Personnalisez l'apparence et le contenu de vos factures
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
              <Label htmlFor="primary_color">Couleur principale</Label>
              <div className="flex gap-2">
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
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          {/* Informations de l'entreprise */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informations de l'entreprise</h3>
            
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
                placeholder="123 rue de la Paix, 75000 Paris"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  placeholder="contact@restaurant.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax_id">Numéro SIRET / TVA</Label>
              <Input
                id="tax_id"
                value={formData.tax_id}
                onChange={(e) => handleChange('tax_id', e.target.value)}
                placeholder="123 456 789 00012"
              />
            </div>
          </div>

          {/* Pied de page */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Pied de page</h3>
            
            <div className="space-y-2">
              <Label htmlFor="payment_terms">Conditions de paiement</Label>
              <Textarea
                id="payment_terms"
                value={formData.payment_terms}
                onChange={(e) => handleChange('payment_terms', e.target.value)}
                placeholder="Paiement à effectuer sous 30 jours..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="footer_note">Note de bas de page (optionnel)</Label>
              <Textarea
                id="footer_note"
                value={formData.footer_note}
                onChange={(e) => handleChange('footer_note', e.target.value)}
                placeholder="Merci de votre confiance..."
                rows={2}
              />
            </div>
          </div>
        </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" disabled={saving} className="gap-2">
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Enregistrer les paramètres
                  </>
                )}
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="preview">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Aperçu en temps réel</CardTitle>
                <CardDescription>
                  Visualisez comment vos factures apparaîtront avec les paramètres actuels
                </CardDescription>
              </CardHeader>
            </Card>
            <InvoicePreview settings={formData} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
