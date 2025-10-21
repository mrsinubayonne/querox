import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useInvoiceSettings } from '@/hooks/useInvoiceSettings';
import { FileText, Save, Loader2 } from 'lucide-react';
import LogoUpload from './LogoUpload';

export const InvoiceSettingsTab: React.FC = () => {
  const { settings, loading, updateSettings } = useInvoiceSettings();
  const [saving, setSaving] = useState(false);
  
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
    if (settings) {
      setFormData({
        invoice_title: settings.invoice_title || 'FACTURE',
        company_name: settings.company_name || '',
        company_address: settings.company_address || '',
        company_phone: settings.company_phone || '',
        company_email: settings.company_email || '',
        tax_id: settings.tax_id || '',
        payment_terms: settings.payment_terms || 'Paiement à effectuer sous 30 jours à compter de la date de facturation.',
        footer_note: settings.footer_note || '',
        logo_url: settings.logo_url || '',
        primary_color: settings.primary_color || '#3B82F6',
      });
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await updateSettings(formData);
    setSaving(false);
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
  );
};
