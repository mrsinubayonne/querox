import React from 'react';
import { Invoice } from '@/hooks/useInvoices';
import { useInvoiceSettings } from '@/hooks/useInvoiceSettings';
import { useRestaurantSettings } from '@/hooks/useRestaurantSettings';
import { useProfile } from '@/hooks/useProfile';

interface InvoicePrintViewProps {
  invoice: Invoice;
  servedBy?: string;
}

const InvoicePrintView: React.FC<InvoicePrintViewProps> = ({ invoice, servedBy }) => {
  const { settings } = useInvoiceSettings();
  const { website } = useRestaurantSettings();
  const { profile } = useProfile();

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="print-only fixed inset-0 bg-white z-[9999] p-8" style={{ fontFamily: 'Arial Black, sans-serif', fontWeight: '900' }}>
      <style>{`
        * {
          font-family: 'Arial Black', sans-serif !important;
          font-weight: 900 !important;
        }
        p, span, td, th, div, h1, h2, h3, h4, h5, h6 {
          font-family: 'Arial Black', sans-serif !important;
          font-weight: 900 !important;
        }
        @media print {
          body * {
            visibility: hidden !important;
          }
          .print-only, .print-only * {
            visibility: visible !important;
          }
          .print-only {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
          }
          @page {
            margin: 1cm;
            size: A4;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
        @media screen {
          .print-only {
            display: none;
          }
        }
      `}</style>

      {/* En-tête */}
      <div className="flex justify-between items-start mb-12 pb-6 border-b-2 border-gray-300">
        <div>
          {(settings?.logo_url || website?.logo_url) && (
            <img 
              src={settings?.logo_url || website?.logo_url} 
              alt="Logo" 
              className="h-32 mb-4" 
            />
          )}
          <h1 className="text-5xl font-bold text-black mb-2">
            {settings?.company_name || website?.name || 'Mon Restaurant'}
          </h1>
          {settings?.company_address && (
            <p className="text-xl text-black whitespace-pre-line" style={{ fontWeight: '900' }}>{settings.company_address}</p>
          )}
          {settings?.company_phone && (
            <p className="text-xl text-black mt-1" style={{ fontWeight: '900' }}>Tél: {settings.company_phone}</p>
          )}
          {settings?.company_email && (
            <p className="text-xl text-black" style={{ fontWeight: '900' }}>{settings.company_email}</p>
          )}
          {settings?.tax_id && (
            <p className="text-xl text-black" style={{ fontWeight: '900' }}>SIRET/TVA: {settings.tax_id}</p>
          )}
        </div>
        <div className="text-right">
          <h2 
            className="text-4xl font-bold mb-2 text-black"
          >
            {settings?.invoice_title || 'FACTURE'}
          </h2>
          <p 
            className="text-2xl text-black"
            style={{ fontWeight: '900' }}
          >
            {invoice.invoice_number}
          </p>
          <p className="text-xl text-black mt-2" style={{ fontWeight: '900' }}>Date: {formatDate(invoice.created_at)}</p>
        </div>
      </div>

      {/* Informations client */}
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-black mb-2" style={{ fontWeight: '900' }}>Facturé à:</h3>
        <p className="text-xl text-black" style={{ fontFamily: 'Arial Black, sans-serif', fontWeight: '900 !important' }}>
          {invoice.customer_name || 'Client'}
        </p>
        {invoice.customer_email && (
          <p className="text-lg text-black" style={{ fontWeight: '900' }}>{invoice.customer_email}</p>
        )}
        {invoice.customer_phone && (
          <p className="text-lg text-black" style={{ fontFamily: 'Arial Black, sans-serif', fontWeight: '900 !important' }}>{invoice.customer_phone}</p>
        )}
        {servedBy && (
          <p className="text-lg text-black mt-2" style={{ fontWeight: '900' }}>Servi par: {servedBy}</p>
        )}
      </div>

      {/* Détails de la facture */}
      <div className="mb-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-3 text-left text-xl" style={{ fontWeight: '900' }}>Article</th>
              <th className="border border-gray-300 px-4 py-3 text-center text-xl" style={{ fontWeight: '900' }}>Quantité</th>
              <th className="border border-gray-300 px-4 py-3 text-right text-xl" style={{ fontWeight: '900' }}>Prix unitaire</th>
              <th className="border border-gray-300 px-4 py-3 text-right text-xl" style={{ fontWeight: '900' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items && Array.isArray(invoice.items) && invoice.items.length > 0 ? (
              invoice.items.map((item: any, index: number) => (
                <tr key={index}>
                  <td className="border border-gray-300 px-4 py-3">
                    <p className="text-lg" style={{ fontWeight: '900' }}>{item.name}</p>
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center text-lg" style={{ fontWeight: '900' }}>
                    {item.quantity}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-right text-lg" style={{ fontWeight: '900' }}>
                    {item.price?.toLocaleString('fr-FR')} FCFA
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-right text-xl" style={{ fontWeight: '900' }}>
                    {((item.price || 0) * (item.quantity || 0)).toLocaleString('fr-FR')} FCFA
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="border border-gray-300 px-4 py-3">
                  <p className="text-lg text-black" style={{ fontWeight: '900' }}>Services et produits</p>
                  {invoice.notes && (
                    <p className="text-lg text-black mt-2" style={{ fontFamily: 'Arial Black, sans-serif', fontWeight: '900 !important' }}>{invoice.notes}</p>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Total */}
      <div className="flex justify-end mb-8">
        <div className="w-64">
          <div className="flex justify-between py-3 border-t-2 border-gray-300">
            <span className="text-2xl text-black" style={{ fontFamily: 'Arial Black, sans-serif', fontWeight: '900 !important' }}>TOTAL:</span>
            <span 
              className="text-2xl text-black"
              style={{ fontFamily: 'Arial Black, sans-serif', fontWeight: '900 !important' }}
            >
              {invoice.total_amount.toLocaleString('fr-FR')} FCFA
            </span>
          </div>
        </div>
      </div>


      {/* Footer */}
      <div className="border-t-2 border-gray-300 pt-4 mt-8">
        {settings?.footer_note && (
          <p className="text-lg text-black mb-3 whitespace-pre-line" style={{ fontFamily: 'Arial Black, sans-serif', fontWeight: '900 !important' }}>
            {settings.footer_note}
          </p>
        )}
        <p className="text-lg text-black text-center mt-6" style={{ fontWeight: '900' }}>
          Généré par QUEROX - Logiciel de gestion, automatisation et optimisation
        </p>
      </div>
    </div>
  );
};

export default InvoicePrintView;
