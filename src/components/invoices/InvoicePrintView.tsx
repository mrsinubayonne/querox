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
          /* Masquer tout le reste du DOM sauf la facture */
          body > *:not(.print-only) {
            display: none !important;
          }
          .print-only {
            position: static !important;
            width: 148mm !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          /* Empêcher la répétition et pagination */
          * {
            page-break-inside: avoid !important;
            page-break-after: avoid !important;
            page-break-before: avoid !important;
          }
          @page {
            size: A5 portrait;
            margin: 8mm;
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
      <div className="flex justify-between items-start mb-2 pb-1 border-b-2 border-gray-300">
        <div>
          {(settings?.logo_url || website?.logo_url) && (
            <img 
              src={settings?.logo_url || website?.logo_url} 
              alt="Logo" 
              className="h-40 mb-1" 
            />
          )}
          <h1 className="text-5xl font-bold text-black mb-0">
            {settings?.company_name || website?.name || 'Mon Restaurant'}
          </h1>
          {settings?.company_address && (
            <p className="text-2xl text-black whitespace-pre-line" style={{ fontWeight: '900' }}>{settings.company_address}</p>
          )}
          {settings?.company_phone && (
            <p className="text-2xl text-black" style={{ fontWeight: '900' }}>Tél: {settings.company_phone}</p>
          )}
          {settings?.company_email && (
            <p className="text-2xl text-black" style={{ fontWeight: '900' }}>{settings.company_email}</p>
          )}
          {settings?.tax_id && (
            <p className="text-2xl text-black" style={{ fontWeight: '900' }}>SIRET/TVA: {settings.tax_id}</p>
          )}
        </div>
        <div className="text-right">
          <h2 
            className="text-5xl font-bold mb-0 text-black"
          >
            {settings?.invoice_title || "FACTURE"}
          </h2>
          <p 
            className="text-3xl text-black"
            style={{ fontWeight: '900' }}
          >
            {invoice.invoice_number}
          </p>
          <p className="text-2xl text-black" style={{ fontWeight: '900' }}>Date: {formatDate(invoice.created_at)}</p>
        </div>
      </div>

      {/* Informations client */}
      <div className="mb-1">
        <h3 className="text-3xl font-bold text-black mb-0" style={{ fontWeight: '900' }}>Facturé à:</h3>
        <p className="text-2xl text-black" style={{ fontFamily: 'Arial Black, sans-serif', fontWeight: '900 !important' }}>
          {invoice.customer_name || "Client"}
        </p>
        {invoice.customer_email && (
          <p className="text-2xl text-black" style={{ fontWeight: '900' }}>{invoice.customer_email}</p>
        )}
        {invoice.customer_phone && (
          <p className="text-2xl text-black" style={{ fontFamily: 'Arial Black, sans-serif', fontWeight: '900 !important' }}>{invoice.customer_phone}</p>
        )}
        {servedBy && (
          <p className="text-2xl text-black" style={{ fontWeight: '900' }}>Servi par: {servedBy}</p>
        )}
      </div>

      {/* Détails de la facture */}
      <div className="mb-1">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-2 py-1 text-left text-2xl" style={{ fontWeight: '900' }}>Article</th>
              <th className="border border-gray-300 px-2 py-1 text-center text-2xl" style={{ fontWeight: '900' }}>Quantité</th>
              <th className="border border-gray-300 px-2 py-1 text-right text-2xl" style={{ fontWeight: '900' }}>Prix unitaire</th>
              <th className="border border-gray-300 px-2 py-1 text-right text-2xl" style={{ fontWeight: '900' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items && Array.isArray(invoice.items) && invoice.items.length > 0 ? (
              invoice.items.map((item: any, index: number) => (
                <tr key={index}>
                  <td className="border border-gray-300 px-2 py-1">
                    <p className="text-2xl" style={{ fontWeight: '900' }}>{item.name}</p>
                  </td>
                  <td className="border border-gray-300 px-2 py-1 text-center text-2xl" style={{ fontWeight: '900' }}>
                    {item.quantity}
                  </td>
                  <td className="border border-gray-300 px-2 py-1 text-right text-2xl" style={{ fontWeight: '900' }}>
                    {item.price?.toLocaleString("fr-FR")} FCFA
                  </td>
                  <td className="border border-gray-300 px-2 py-1 text-right text-2xl" style={{ fontWeight: '900' }}>
                    {((item.price || 0) * (item.quantity || 0)).toLocaleString("fr-FR")} FCFA
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="border border-gray-300 px-2 py-1">
                  <p className="text-2xl text-black" style={{ fontWeight: '900' }}>Services et produits</p>
                  {invoice.notes && (
                    <p className="text-2xl text-black" style={{ fontFamily: 'Arial Black, sans-serif', fontWeight: '900 !important' }}>{invoice.notes}</p>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Total */}
      <div className="flex justify-end mb-1">
        <div className="w-64">
          <div className="flex justify-between py-1 border-t-2 border-gray-300">
            <span className="text-4xl text-black" style={{ fontFamily: 'Arial Black, sans-serif', fontWeight: '900 !important' }}>TOTAL:</span>
            <span 
              className="text-4xl text-black"
              style={{ fontFamily: 'Arial Black, sans-serif', fontWeight: '900 !important' }}
            >
              {invoice.total_amount.toLocaleString("fr-FR")} FCFA
            </span>
          </div>
        </div>
      </div>


      {/* Footer */}
      <div className="border-t-2 border-gray-300 pt-1 mt-1">
        {settings?.footer_note && (
          <p className="text-xl text-black mb-1 whitespace-pre-line" style={{ fontFamily: 'Arial Black, sans-serif', fontWeight: '900 !important' }}>
            {settings.footer_note}
          </p>
        )}
        <p className="text-xl text-black text-center" style={{ fontWeight: '900' }}>
          Généré par QUEROX - Logiciel de gestion, automatisation et optimisation
        </p>
      </div>
    </div>
  );
};

export default InvoicePrintView;
