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
  return (
    <Card className="p-12 bg-white shadow-lg max-w-4xl mx-auto">
      {/* En-tête avec logo et titre FACTURE */}
      <div className="flex justify-between items-start mb-12">
        <div>
          {settings.logo_url && (
            <img 
              src={settings.logo_url} 
              alt="Logo" 
              className="h-16 mb-2 object-contain" 
            />
          )}
          {settings.company_name && (
            <h1 className="text-xl font-bold text-black uppercase tracking-wide">
              {settings.company_name}
            </h1>
          )}
        </div>
        <div>
          <h2 className="text-6xl font-bold text-black uppercase tracking-tight">
            {settings.invoice_title || 'FACTURE'}
          </h2>
        </div>
      </div>

      {/* Date et Numéro de facture */}
      <div className="flex justify-between items-start mb-10 pb-6 border-b-2 border-black">
        <div>
          <p className="text-sm font-bold text-black uppercase">
            DATE : {new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, ' / ')}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-black uppercase">
            FACTURE N° : INV-202501-0001
          </p>
        </div>
      </div>

      {/* Émetteur et Destinataire */}
      <div className="flex justify-between mb-12">
        <div className="w-5/12">
          <h3 className="text-sm font-bold text-black mb-3 uppercase">ÉMETTEUR :</h3>
          {settings.company_phone && (
            <p className="text-sm text-black mb-1">{settings.company_phone}</p>
          )}
          {settings.company_email && (
            <p className="text-sm text-black mb-1">{settings.company_email}</p>
          )}
          {settings.company_address && (
            <p className="text-sm text-black whitespace-pre-line">{settings.company_address}</p>
          )}
        </div>
        <div className="w-5/12 text-right">
          <h3 className="text-sm font-bold text-black mb-3 uppercase">DESTINATAIRE :</h3>
          <p className="text-sm font-bold text-black mb-1">CLIENT EXEMPLE</p>
          <p className="text-sm text-black mb-1">client@exemple.com</p>
          <p className="text-sm text-black">123 Rue Exemple,<br />75000 Paris</p>
        </div>
      </div>

      {/* Tableau des articles */}
      <div className="mb-10">
        <div className="border-b-2 border-black mb-2">
          <div className="grid grid-cols-12 gap-4 pb-2">
            <div className="col-span-6">
              <p className="text-sm font-bold text-black uppercase">Description :</p>
            </div>
            <div className="col-span-2 text-right">
              <p className="text-sm font-bold text-black uppercase">Prix Unitaire :</p>
            </div>
            <div className="col-span-2 text-center">
              <p className="text-sm font-bold text-black uppercase">Quantité :</p>
            </div>
            <div className="col-span-2 text-right">
              <p className="text-sm font-bold text-black uppercase">Total :</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-0">
          <div className="grid grid-cols-12 gap-4 py-4 border-b border-black">
            <div className="col-span-6">
              <p className="text-sm text-black">Services et produits</p>
            </div>
            <div className="col-span-2 text-right">
              <p className="text-sm text-black">15,000 FCFA</p>
            </div>
            <div className="col-span-2 text-center">
              <p className="text-sm text-black">1</p>
            </div>
            <div className="col-span-2 text-right">
              <p className="text-sm text-black">15,000 FCFA</p>
            </div>
          </div>
          
          {/* Lignes vides pour l'espacement */}
          <div className="grid grid-cols-12 gap-4 py-4 border-b border-black">
            <div className="col-span-6"><p className="text-sm text-black">-</p></div>
            <div className="col-span-2 text-right"><p className="text-sm text-black">-</p></div>
            <div className="col-span-2 text-center"><p className="text-sm text-black">-</p></div>
            <div className="col-span-2 text-right"><p className="text-sm text-black">-</p></div>
          </div>
          <div className="grid grid-cols-12 gap-4 py-4 border-b border-black">
            <div className="col-span-6"><p className="text-sm text-black">-</p></div>
            <div className="col-span-2 text-right"><p className="text-sm text-black">-</p></div>
            <div className="col-span-2 text-center"><p className="text-sm text-black">-</p></div>
            <div className="col-span-2 text-right"><p className="text-sm text-black">-</p></div>
          </div>
        </div>
      </div>

      {/* Section Totaux */}
      <div className="flex justify-end">
        <div className="w-5/12">
          <div className="space-y-2">
            <div className="flex justify-between pt-2 border-t-2 border-black">
              <p className="text-lg font-bold text-black uppercase">TOTAL :</p>
              <p className="text-lg font-bold text-black">15,000 FCFA</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default InvoicePreview;
