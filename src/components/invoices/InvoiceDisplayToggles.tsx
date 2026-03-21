import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
import { InvoiceDisplayOptions, DEFAULT_DISPLAY_OPTIONS } from '@/types/invoiceDisplayOptions';

interface InvoiceDisplayTogglesProps {
  displayOptions: InvoiceDisplayOptions;
  onChange: (options: InvoiceDisplayOptions) => void;
}

const TOGGLE_ITEMS: { key: keyof InvoiceDisplayOptions; label: string; group: string }[] = [
  { key: 'show_logo', label: 'Logo de l\'entreprise', group: 'En-tête' },
  { key: 'show_company_address', label: 'Adresse de l\'entreprise', group: 'En-tête' },
  { key: 'show_company_phone', label: 'Téléphone', group: 'En-tête' },
  { key: 'show_company_email', label: 'Email', group: 'En-tête' },
  { key: 'show_tax_id', label: 'SIRET / TVA', group: 'En-tête' },
  { key: 'show_rccm', label: 'Numéro RCCM', group: 'En-tête' },
  { key: 'show_nif', label: 'Numéro NIU', group: 'En-tête' },
  { key: 'show_other_registration', label: 'Autre immatriculation', group: 'En-tête' },
  { key: 'show_invoice_number', label: 'Numéro de facture', group: 'Détails' },
  { key: 'show_date', label: 'Date de la facture', group: 'Détails' },
  { key: 'show_table_number', label: 'Numéro de table', group: 'Détails' },
  { key: 'show_served_by', label: '"Servi par"', group: 'Détails' },
  { key: 'show_customer_info', label: 'Informations client', group: 'Détails' },
  { key: 'show_payment_terms', label: 'Conditions de paiement', group: 'Pied de page' },
  { key: 'show_footer_note', label: 'Note de bas de page', group: 'Pied de page' },
  { key: 'show_querox_branding', label: 'Branding QUEROX', group: 'Pied de page' },
];

const InvoiceDisplayToggles: React.FC<InvoiceDisplayTogglesProps> = ({ displayOptions, onChange }) => {
  const options = { ...DEFAULT_DISPLAY_OPTIONS, ...displayOptions };

  const handleToggle = (key: keyof InvoiceDisplayOptions) => {
    onChange({ ...options, [key]: !options[key] });
  };

  const groups = ['En-tête', 'Détails', 'Pied de page'];

  const enabledCount = Object.values(options).filter(Boolean).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-primary" />
          <CardTitle className="text-base">Options d'affichage</CardTitle>
        </div>
        <CardDescription>
          Choisissez les éléments à afficher sur vos factures ({enabledCount}/{TOGGLE_ITEMS.length} actifs)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {groups.map((group) => (
          <div key={group} className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{group}</h4>
            <div className="space-y-2">
              {TOGGLE_ITEMS.filter((item) => item.group === group).map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Label
                    htmlFor={item.key}
                    className="flex items-center gap-2 cursor-pointer text-sm"
                  >
                    {options[item.key] ? (
                      <Eye className="w-3.5 h-3.5 text-primary" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                    {item.label}
                  </Label>
                  <Switch
                    id={item.key}
                    checked={options[item.key]}
                    onCheckedChange={() => handleToggle(item.key)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default InvoiceDisplayToggles;
