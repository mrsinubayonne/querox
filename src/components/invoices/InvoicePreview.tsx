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
    <Card className="p-0 bg-black shadow-lg max-w-4xl mx-auto overflow-hidden">
      <div className="p-12 bg-black text-white">
        {/* En-tête: Logo + Restaurant Name à gauche, Invoice badge à droite */}
        <div className="flex justify-between items-start mb-12">
          <div className="flex items-center gap-3">
            {settings.logo_url && (
              <img 
                src={settings.logo_url} 
                alt="Logo" 
                className="h-12 w-12 object-contain" 
              />
            )}
            <div>
              <h1 className="text-xl font-bold text-white">
                {settings.company_name || 'Restaurant'}
              </h1>
            </div>
          </div>
          <div className="bg-white px-6 py-2 rounded-full">
            <p className="text-black font-bold text-lg">
              {settings.invoice_title || 'Facture'}
            </p>
          </div>
        </div>

        {/* Destinataire et Détails */}
        <div className="flex justify-between mb-8">
          <div>
            <h3 className="text-sm font-bold text-white mb-3">TO: Jony Bristow</h3>
            <p className="text-sm text-gray-300">
              {settings.company_address || 'Malaga, volume 42b4,\nstreet 42t, spain'}
            </p>
            <p className="text-sm text-gray-300 mt-2">
              📞 {settings.company_phone || '060 123 456 789'}
            </p>
          </div>
          <div className="text-right">
            <h3 className="text-sm font-bold text-white mb-3">Invoice Details</h3>
            <p className="text-sm text-gray-300">
              Date: {new Date().toLocaleDateString('fr-FR')}
            </p>
            <p className="text-sm text-gray-300">
              Invoice no: INV-202501-0001
            </p>
          </div>
        </div>

        {/* Tableau des items */}
        <div className="mb-8">
          {/* En-tête du tableau */}
          <div className="bg-white rounded-t-lg">
            <div className="grid grid-cols-12 gap-4 px-4 py-3">
              <div className="col-span-2">
                <p className="text-sm font-bold text-black">Qty</p>
              </div>
              <div className="col-span-6">
                <p className="text-sm font-bold text-black">Item Description</p>
              </div>
              <div className="col-span-2 text-right">
                <p className="text-sm font-bold text-black">Price</p>
              </div>
              <div className="col-span-2 text-right">
                <p className="text-sm font-bold text-black">Total</p>
              </div>
            </div>
          </div>
          
          {/* Corps du tableau */}
          <div className="bg-gray-900">
            <div className="grid grid-cols-12 gap-4 px-4 py-4 border-b border-gray-700">
              <div className="col-span-2">
                <p className="text-sm text-white">1</p>
              </div>
              <div className="col-span-6">
                <p className="text-sm text-white">Services et produits</p>
              </div>
              <div className="col-span-2 text-right">
                <p className="text-sm text-white">15,000</p>
              </div>
              <div className="col-span-2 text-right">
                <p className="text-sm text-white">15,000</p>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-4 px-4 py-4 border-b border-gray-700">
              <div className="col-span-2">
                <p className="text-sm text-white">2</p>
              </div>
              <div className="col-span-6">
                <p className="text-sm text-white">Article exemple</p>
              </div>
              <div className="col-span-2 text-right">
                <p className="text-sm text-white">5,000</p>
              </div>
              <div className="col-span-2 text-right">
                <p className="text-sm text-white">10,000</p>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-4 px-4 py-4">
              <div className="col-span-2">
                <p className="text-sm text-white">1</p>
              </div>
              <div className="col-span-6">
                <p className="text-sm text-white">Autre article</p>
              </div>
              <div className="col-span-2 text-right">
                <p className="text-sm text-white">3,000</p>
              </div>
              <div className="col-span-2 text-right">
                <p className="text-sm text-white">3,000</p>
              </div>
            </div>
          </div>
        </div>

        {/* Totaux */}
        <div className="flex justify-end mb-8">
          <div className="w-80">
            <div className="flex justify-between py-2 text-white">
              <p className="text-sm">Sub Total:</p>
              <p className="text-sm">28,000 FCFA</p>
            </div>
            <div className="flex justify-between py-2 text-white">
              <p className="text-sm">Tax:</p>
              <p className="text-sm">20%</p>
            </div>
            <div className="bg-white rounded-full px-6 py-3 flex justify-between mt-3">
              <p className="text-sm font-bold text-black">Total:</p>
              <p className="text-sm font-bold text-black">33,600 FCFA</p>
            </div>
          </div>
        </div>

        {/* Section Info */}
        <div className="border-t border-gray-700 pt-8">
          <h3 className="text-sm font-bold text-white mb-4">Info:</h3>
          <p className="text-sm text-gray-300 mb-2">
            {settings.company_address || 'Malaga, volume 42b4,\nstreet 42t, spain'}
          </p>
          <p className="text-sm text-gray-300 mb-6">
            📞 {settings.company_phone || '060 123 456 789'}
          </p>
          
          {settings.footer_note && (
            <p className="text-xs text-gray-400 mb-4">
              {settings.footer_note}
            </p>
          )}
          
          <p className="text-sm text-white font-semibold mb-2">
            Thank you very much
          </p>
          <p className="text-xs text-gray-400">
            {settings.payment_terms || 'Paiement par virement bancaire'}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default InvoicePreview;
