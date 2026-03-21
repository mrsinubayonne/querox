import React from 'react';
import { Card } from '@/components/ui/card';
import { InvoiceDisplayOptions, DEFAULT_DISPLAY_OPTIONS } from '@/types/invoiceDisplayOptions';

interface InvoicePreviewProps {
  settings: {
    invoice_title?: string;
    company_name?: string;
    company_address?: string;
    company_phone?: string;
    company_email?: string;
    tax_id?: string;
    nif_number?: string;
    rccm_number?: string;
    other_registration?: string;
    payment_terms?: string;
    footer_note?: string;
    logo_url?: string;
    primary_color?: string;
  };
  displayOptions?: InvoiceDisplayOptions;
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({ settings, displayOptions }) => {
  const opts = { ...DEFAULT_DISPLAY_OPTIONS, ...displayOptions };

  return (
    <Card className="p-8 bg-white shadow-lg max-w-4xl mx-auto">
      {/* En-tête */}
      <div className="flex justify-between items-start mb-8 pb-6 border-b-2" style={{ borderColor: settings.primary_color || '#3B82F6' }}>
        <div>
          {opts.show_logo && settings.logo_url && (
            <img 
              src={settings.logo_url} 
              alt="Logo" 
              className="h-12 mb-2" 
            />
          )}
          <h1 className="text-2xl font-bold text-black mb-1">
            {settings.company_name || 'Nom de l\'entreprise'}
          </h1>
          {opts.show_company_address && settings.company_address && (
            <p className="text-sm text-black whitespace-pre-line">{settings.company_address}</p>
          )}
          {opts.show_company_phone && settings.company_phone && (
            <p className="text-xs text-black mt-1">Tél: {settings.company_phone}</p>
          )}
          {opts.show_company_email && settings.company_email && (
            <p className="text-xs text-black">{settings.company_email}</p>
          )}
          {opts.show_tax_id && settings.tax_id && (
            <p className="text-xs text-black">SIRET/TVA: {settings.tax_id}</p>
          )}
          {opts.show_nif && settings.nif_number && (
            <p className="text-xs text-black">NIU: {settings.nif_number}</p>
          )}
          {opts.show_rccm && settings.rccm_number && (
            <p className="text-xs text-black">RCCM: {settings.rccm_number}</p>
          )}
          {opts.show_other_registration && settings.other_registration && (
            <p className="text-xs text-black">{settings.other_registration}</p>
          )}
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold mb-1 text-black">
            {settings.invoice_title || 'FACTURE'}
          </h2>
          {opts.show_invoice_number && (
            <p className="text-base font-semibold text-black">
              INV-202501-0001
            </p>
          )}
          {opts.show_date && (
            <p className="text-xs text-black mt-1">Date: {new Date().toLocaleDateString('fr-FR')}</p>
          )}
          {opts.show_table_number && (
            <p className="text-xs text-black mt-1">Table: 5</p>
          )}
        </div>
      </div>

      {/* Informations client */}
      {opts.show_customer_info && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-black mb-1">Facturé à:</h3>
          <p className="text-sm text-black">Client Exemple</p>
          <p className="text-xs text-black">client@exemple.com</p>
          <p className="text-xs text-black">+33 6 12 34 56 78</p>
        </div>
      )}

      {/* Served by */}
      {opts.show_served_by && (
        <p className="text-xs text-black mb-4">Servi par: Jean Dupont</p>
      )}

      {/* Tableau */}
      <div className="mb-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-3 py-2 text-left text-xs font-normal">Description</th>
              <th className="border border-gray-300 px-3 py-2 text-right text-xs font-normal">Montant</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 px-3 py-2 text-sm">
                <p className="font-medium text-black">Services et produits</p>
                <p className="text-xs text-black">Exemple de description</p>
              </td>
              <td className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold text-black">
                15,000 XAF
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Total */}
      <div className="flex justify-end mb-8">
        <div className="w-48">
          <div className="flex justify-between py-2 border-t-2 border-gray-300">
            <span className="text-sm font-semibold text-black">TOTAL:</span>
            <span 
              className="font-bold text-base text-black"
              style={{ fontFamily: 'Arial Black, sans-serif', fontWeight: '900' }}
            >
              15,000 XAF
            </span>
          </div>
        </div>
      </div>

      {/* Informations de paiement */}
      <div className="mb-6 p-3 bg-gray-50 rounded">
        <h3 className="text-sm font-semibold text-black mb-2">Informations de paiement</h3>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <p className="text-black">Statut:</p>
            <p className="font-semibold text-black">EN ATTENTE</p>
          </div>
          <div>
            <p className="text-black">Date d'échéance:</p>
            <p className="font-semibold text-black">
              {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>
      </div>

      {/* Conditions */}
      <div className="border-t-2 pt-4 mt-6" style={{ borderColor: settings.primary_color || '#3B82F6' }}>
        {opts.show_payment_terms && (
          <>
            <h3 className="text-xs font-semibold text-black mb-1">Conditions de paiement:</h3>
            <p className="text-xs text-black mb-3 whitespace-pre-line">
              {settings.payment_terms || 'Paiement à effectuer sous 30 jours à compter de la date de facturation.'}
            </p>
          </>
        )}
        {opts.show_footer_note && settings.footer_note && (
          <p className="text-xs text-black mb-3 whitespace-pre-line">
            {settings.footer_note}
          </p>
        )}
        {opts.show_querox_branding && (
          <p className="text-xs text-black text-center mt-4">
            Généré par QUEROX.me
          </p>
        )}
      </div>
    </Card>
  );
};

export default InvoicePreview;
