import React from 'react';
import { Invoice } from '@/hooks/useInvoices';
import { useInvoiceSettings } from '@/hooks/useInvoiceSettings';
import { useRestaurantSettings } from '@/hooks/useRestaurantSettings';

interface InvoicePrintViewProps {
  invoice: Invoice;
  servedBy?: string;
}

const InvoicePrintView: React.FC<InvoicePrintViewProps> = ({ invoice, servedBy }) => {
  const { settings } = useInvoiceSettings();
  const { website } = useRestaurantSettings();

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, ' / ');
  };

  const calculateTotals = () => {
    const totalHT = invoice.total_amount;
    const tva = totalHT * 0.20; // TVA 20%
    const totalTTC = totalHT + tva;
    return { totalHT, tva, totalTTC };
  };

  const { totalHT, tva, totalTTC } = calculateTotals();

  return (
    <div className="print-only fixed inset-0 bg-black z-[9999] p-16">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-only, .print-only * {
            visibility: visible;
          }
          .print-only {
            position: fixed;
            left: 0;
            top: 0;
            width: 100%;
            background: black !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          @page {
            margin: 1.5cm;
            size: A4;
          }
        }
        @media screen {
          .print-only {
            display: none;
          }
        }
      `}</style>

      <div className="text-white">
        {/* En-tête: Logo + Restaurant Name à gauche, Invoice badge à droite */}
        <div className="flex justify-between items-start mb-16">
          <div className="flex items-center gap-4">
            {(settings?.logo_url || website?.logo_url) && (
              <img 
                src={settings?.logo_url || website?.logo_url} 
                alt="Logo" 
                className="h-16 w-16 object-contain" 
              />
            )}
            <div>
              <h1 className="text-2xl font-bold text-white">
                {settings?.company_name || website?.name || 'Restaurant'}
              </h1>
            </div>
          </div>
          <div className="bg-white px-8 py-3 rounded-full">
            <p className="text-black font-bold text-2xl">
              {settings?.invoice_title || 'Facture'}
            </p>
          </div>
        </div>

        {/* Destinataire et Détails */}
        <div className="flex justify-between mb-12">
          <div>
            <h3 className="text-base font-bold text-white mb-4">TO: {invoice.order?.customer_name || 'Client'}</h3>
            {invoice.order?.customer_email && (
              <p className="text-base text-gray-300">{invoice.order.customer_email}</p>
            )}
            {invoice.order?.customer_phone && (
              <p className="text-base text-gray-300 mt-1">📞 {invoice.order.customer_phone}</p>
            )}
            {settings?.company_address && (
              <p className="text-sm text-gray-400 mt-3 whitespace-pre-line">{settings.company_address}</p>
            )}
            {servedBy && (
              <p className="text-sm text-gray-400 mt-2">Servi par: {servedBy}</p>
            )}
          </div>
          <div className="text-right">
            <h3 className="text-base font-bold text-white mb-4">Invoice Details</h3>
            <p className="text-base text-gray-300">
              Date: {formatDate(invoice.created_at)}
            </p>
            <p className="text-base text-gray-300 mt-1">
              Échéance: {formatDate(invoice.due_date)}
            </p>
            <p className="text-base text-gray-300 mt-1">
              Invoice no: {invoice.invoice_number}
            </p>
          </div>
        </div>

        {/* Tableau des items */}
        <div className="mb-12">
          {/* En-tête du tableau */}
          <div className="bg-white rounded-t-lg">
            <div className="grid grid-cols-12 gap-4 px-6 py-4">
              <div className="col-span-2">
                <p className="text-base font-bold text-black">Qty</p>
              </div>
              <div className="col-span-6">
                <p className="text-base font-bold text-black">Item Description</p>
              </div>
              <div className="col-span-2 text-right">
                <p className="text-base font-bold text-black">Price</p>
              </div>
              <div className="col-span-2 text-right">
                <p className="text-base font-bold text-black">Total</p>
              </div>
            </div>
          </div>
          
          {/* Corps du tableau */}
          <div className="bg-gray-900">
            {invoice.order?.items && Array.isArray(invoice.order.items) && invoice.order.items.length > 0 ? (
              <>
                {invoice.order.items.map((item: any, index: number) => (
                  <div key={index} className="grid grid-cols-12 gap-4 px-6 py-5 border-b border-gray-700">
                    <div className="col-span-2">
                      <p className="text-base text-white">{item.quantity}</p>
                    </div>
                    <div className="col-span-6">
                      <p className="text-base text-white">{item.name}</p>
                    </div>
                    <div className="col-span-2 text-right">
                      <p className="text-base text-white">{item.price?.toLocaleString('fr-FR')}</p>
                    </div>
                    <div className="col-span-2 text-right">
                      <p className="text-base text-white">
                        {((item.price || 0) * (item.quantity || 0)).toLocaleString('fr-FR')}
                      </p>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="grid grid-cols-12 gap-4 px-6 py-5">
                <div className="col-span-2">
                  <p className="text-base text-white">1</p>
                </div>
                <div className="col-span-6">
                  <p className="text-base text-white">Services et produits</p>
                </div>
                <div className="col-span-2 text-right">
                  <p className="text-base text-white">{totalHT.toLocaleString('fr-FR')}</p>
                </div>
                <div className="col-span-2 text-right">
                  <p className="text-base text-white">{totalHT.toLocaleString('fr-FR')}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Totaux */}
        <div className="flex justify-end mb-12">
          <div className="w-96">
            <div className="flex justify-between py-3 text-white">
              <p className="text-base">Sub Total:</p>
              <p className="text-base">{totalHT.toLocaleString('fr-FR')} FCFA</p>
            </div>
            <div className="flex justify-between py-3 text-white">
              <p className="text-base">Tax:</p>
              <p className="text-base">20%</p>
            </div>
            <div className="bg-white rounded-full px-8 py-4 flex justify-between mt-4">
              <p className="text-base font-bold text-black">Total:</p>
              <p className="text-base font-bold text-black">{totalTTC.toLocaleString('fr-FR')} FCFA</p>
            </div>
          </div>
        </div>

        {/* Section Info */}
        <div className="border-t border-gray-700 pt-10">
          <h3 className="text-base font-bold text-white mb-5">Info:</h3>
          {settings?.company_address && (
            <p className="text-base text-gray-300 mb-3 whitespace-pre-line">
              {settings.company_address}
            </p>
          )}
          {settings?.company_phone && (
            <p className="text-base text-gray-300 mb-8">
              📞 {settings.company_phone}
            </p>
          )}
          
          {settings?.footer_note && (
            <p className="text-sm text-gray-400 mb-5">
              {settings.footer_note}
            </p>
          )}
          
          <p className="text-base text-white font-semibold mb-3">
            Thank you very much
          </p>
          {settings?.payment_terms && (
            <p className="text-sm text-gray-400">
              {settings.payment_terms}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoicePrintView;
