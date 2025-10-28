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
          }
          @page {
            margin: 1cm;
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
              className="h-20 mb-4" 
            />
          )}
          <h1 className="text-5xl font-bold text-gray-900 mb-3">
            {settings?.company_name || website?.name || 'Mon Restaurant'}
          </h1>
          {settings?.company_address && (
            <p className="text-base text-gray-700 whitespace-pre-line" style={{ fontWeight: '900' }}>{settings.company_address}</p>
          )}
          {settings?.company_phone && (
            <p className="text-base text-gray-700 mt-1" style={{ fontWeight: '900' }}>Tél: {settings.company_phone}</p>
          )}
          {settings?.company_email && (
            <p className="text-base text-gray-700" style={{ fontWeight: '900' }}>{settings.company_email}</p>
          )}
          {settings?.tax_id && (
            <p className="text-base text-gray-700" style={{ fontWeight: '900' }}>SIRET/TVA: {settings.tax_id}</p>
          )}
        </div>
        <div className="text-right">
          <h2 
            className="text-3xl font-bold mb-2 text-black"
          >
            {settings?.invoice_title || 'FACTURE'}
          </h2>
          <p 
            className="text-2xl text-black"
            style={{ fontWeight: '900' }}
          >
            {invoice.invoice_number}
          </p>
          <p className="text-base text-gray-700 mt-2" style={{ fontWeight: '900' }}>Date: {formatDate(invoice.created_at)}</p>
        </div>
      </div>

      {/* Informations client */}
      <div className="mb-8">
        <h3 className="text-xl text-gray-900 mb-3" style={{ fontWeight: '900' }}>Facturé à:</h3>
        <p className="text-lg text-gray-900" style={{ fontFamily: 'Arial Black, sans-serif', fontWeight: '900 !important' }}>
          {invoice.order?.customer_name || 'Client'}
        </p>
        {invoice.order?.customer_email && (
          <p className="text-base text-gray-700" style={{ fontWeight: '900' }}>{invoice.order.customer_email}</p>
        )}
        {invoice.order?.customer_phone && (
          <p className="text-base text-gray-700" style={{ fontFamily: 'Arial Black, sans-serif', fontWeight: '900 !important' }}>{invoice.order.customer_phone}</p>
        )}
        {servedBy && (
          <p className="text-base text-gray-900 mt-2" style={{ fontWeight: '900' }}>Servi par: {servedBy}</p>
        )}
      </div>

      {/* Détails de la facture */}
      <div className="mb-8">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-6 py-4 text-left text-lg" style={{ fontWeight: '900' }}>Article</th>
              <th className="border border-gray-300 px-6 py-4 text-center text-lg" style={{ fontWeight: '900' }}>Quantité</th>
              <th className="border border-gray-300 px-6 py-4 text-right text-lg" style={{ fontWeight: '900' }}>Prix unitaire</th>
              <th className="border border-gray-300 px-6 py-4 text-right text-lg" style={{ fontWeight: '900' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.order?.items && Array.isArray(invoice.order.items) && invoice.order.items.length > 0 ? (
              invoice.order.items.map((item: any, index: number) => (
                <tr key={index}>
                  <td className="border border-gray-300 px-6 py-4">
                    <p className="text-base" style={{ fontWeight: '900' }}>{item.name}</p>
                  </td>
                  <td className="border border-gray-300 px-6 py-4 text-center text-base" style={{ fontWeight: '900' }}>
                    {item.quantity}
                  </td>
                  <td className="border border-gray-300 px-6 py-4 text-right text-base" style={{ fontWeight: '900' }}>
                    {item.price?.toLocaleString('fr-FR')} FCFA
                  </td>
                  <td className="border border-gray-300 px-6 py-4 text-right text-lg" style={{ fontWeight: '900' }}>
                    {((item.price || 0) * (item.quantity || 0)).toLocaleString('fr-FR')} FCFA
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="border border-gray-300 px-6 py-4">
                  <p className="text-base" style={{ fontWeight: '900' }}>Services et produits</p>
                  {invoice.notes && (
                    <p className="text-base text-gray-700 mt-2" style={{ fontFamily: 'Arial Black, sans-serif', fontWeight: '900 !important' }}>{invoice.notes}</p>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Total */}
      <div className="flex justify-end mb-12">
        <div className="w-80">
          <div className="flex justify-between py-3 border-t-2 border-gray-300">
            <span className="text-xl text-gray-900" style={{ fontFamily: 'Arial Black, sans-serif', fontWeight: '900 !important' }}>TOTAL:</span>
            <span 
              className="text-2xl text-black"
              style={{ fontFamily: 'Arial Black, sans-serif', fontWeight: '900 !important' }}
            >
              {invoice.total_amount.toLocaleString('fr-FR')} FCFA
            </span>
          </div>
        </div>
      </div>

      {/* Informations de paiement */}
      <div className="mb-8 p-6 bg-gray-50 rounded">
        <h3 className="text-xl text-gray-900 mb-4" style={{ fontWeight: '900' }}>Informations de paiement</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-base text-gray-700" style={{ fontWeight: '900' }}>Statut:</p>
            <p className="text-lg text-gray-900" style={{ fontWeight: '900' }}>
              {invoice.status === 'paid' ? 'PAYÉE' : 
               invoice.status === 'unpaid' ? 'EN ATTENTE' : 'EN RETARD'}
            </p>
          </div>
          {invoice.paid_date && (
            <div>
              <p className="text-base text-gray-700" style={{ fontWeight: '900' }}>Date de paiement:</p>
              <p className="text-lg text-gray-900" style={{ fontFamily: 'Arial Black, sans-serif', fontWeight: '900 !important' }}>{formatDate(invoice.paid_date)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t-2 border-gray-300 pt-6 mt-12">
        {settings?.footer_note && (
          <p className="text-sm text-gray-700 mb-4 whitespace-pre-line" style={{ fontFamily: 'Arial Black, sans-serif', fontWeight: '900 !important' }}>
            {settings.footer_note}
          </p>
        )}
        <p className="text-sm text-gray-900 text-center mt-8" style={{ fontWeight: '900' }}>
          Généré par QUEROX - Logiciel de gestion, automatisation et optimisation
        </p>
      </div>
    </div>
  );
};

export default InvoicePrintView;
