import React from 'react';
import { Card } from '@/components/ui/card';

interface InvoicePreviewProps {
  settings: {
    invoice_title?: string;
    company_name?: string;
    company_address?: string;
    company_phone?: string;
    company_email?: string;
    tax_id?: string;
    payment_terms?: string;
    footer_note?: string;
    logo_url?: string;
    primary_color?: string;
  };
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({ settings }) => {
  const primaryColor = settings.primary_color || '#3B82F6';
  
  return (
    <Card className="p-10 bg-white shadow-xl max-w-4xl mx-auto">
      {/* En-tête moderne avec logo et infos entreprise */}
      <div className="flex justify-between items-start mb-12">
        <div className="flex-1">
          {settings.logo_url && (
            <img 
              src={settings.logo_url} 
              alt="Logo" 
              className="h-16 mb-4 object-contain" 
            />
          )}
          <h1 className="text-3xl font-bold text-black mb-2">
            {settings.company_name || 'Nom de l\'entreprise'}
          </h1>
          <div className="space-y-1">
            {settings.company_address && (
              <p className="text-sm text-black leading-relaxed">{settings.company_address}</p>
            )}
            <div className="flex gap-4 text-sm text-black">
              {settings.company_phone && <span>📞 {settings.company_phone}</span>}
              {settings.company_email && <span>✉ {settings.company_email}</span>}
            </div>
            {settings.tax_id && (
              <p className="text-xs text-black">SIRET/TVA: {settings.tax_id}</p>
            )}
          </div>
        </div>
        
        <div className="text-right">
          <div 
            className="inline-block px-6 py-3 rounded-lg mb-3"
            style={{ backgroundColor: primaryColor }}
          >
            <h2 className="text-2xl font-bold text-white">
              {settings.invoice_title || 'FACTURE'}
            </h2>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-xs text-black mb-1">Numéro</p>
            <p className="text-lg font-bold text-black">INV-202501-0001</p>
            <p className="text-xs text-black mt-2">
              {new Date().toLocaleDateString('fr-FR', { 
                day: '2-digit', 
                month: 'long', 
                year: 'numeric' 
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Informations client dans une box */}
      <div className="bg-gray-50 p-6 rounded-lg mb-8">
        <h3 className="text-xs font-semibold text-black mb-3 uppercase tracking-wide">Facturé à</h3>
        <p className="text-base font-semibold text-black">Client Exemple</p>
        <p className="text-sm text-black">client@exemple.com</p>
        <p className="text-sm text-black">+33 6 12 34 56 78</p>
      </div>

      {/* Tableau moderne */}
      <div className="mb-8">
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: primaryColor }}>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Description</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-white">Montant</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              <tr className="border-b border-gray-200">
                <td className="px-6 py-5">
                  <p className="font-semibold text-black">Services et produits</p>
                  <p className="text-sm text-black mt-1">Exemple de description détaillée du service fourni</p>
                </td>
                <td className="px-6 py-5 text-right">
                  <p className="text-lg font-bold text-black">15,000 FCFA</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Total avec design moderne */}
      <div className="flex justify-end mb-10">
        <div className="w-80">
          <div 
            className="p-6 rounded-lg text-white"
            style={{ backgroundColor: primaryColor }}
          >
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">MONTANT TOTAL</span>
              <span className="text-3xl font-bold">15,000 FCFA</span>
            </div>
          </div>
        </div>
      </div>

      {/* Informations de paiement */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-50 p-5 rounded-lg">
          <p className="text-xs text-black mb-2 uppercase tracking-wide">Statut</p>
          <p className="font-bold text-black text-lg">EN ATTENTE</p>
        </div>
        <div className="bg-gray-50 p-5 rounded-lg">
          <p className="text-xs text-black mb-2 uppercase tracking-wide">Date d'échéance</p>
          <p className="font-bold text-black text-lg">
            {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric'
            })}
          </p>
        </div>
      </div>

      {/* Conditions de paiement */}
      <div className="border-t pt-6 mt-8">
        <h3 className="text-xs font-semibold text-black mb-3 uppercase tracking-wide">
          Conditions de paiement
        </h3>
        <p className="text-sm text-black mb-4 leading-relaxed">
          {settings.payment_terms || 'Paiement à effectuer sous 30 jours à compter de la date de facturation.'}
        </p>
        {settings.footer_note && (
          <p className="text-sm text-black mb-4 leading-relaxed">
            {settings.footer_note}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="text-center mt-10 pt-6 border-t">
        <p className="text-xs text-black">
          Généré par QUEROX - Logiciel de gestion, automatisation et optimisation
        </p>
      </div>
    </Card>
  );
};

export default InvoicePreview;
