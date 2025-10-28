import React from 'react';
import { Invoice } from '@/hooks/useInvoices';
import { useInvoiceSettings } from '@/hooks/useInvoiceSettings';
import { useRestaurantSettings } from '@/hooks/useRestaurantSettings';
import { useProfile } from '@/hooks/useProfile';

interface InvoicePrintViewProps {
  invoice: Invoice;
}

const InvoicePrintView: React.FC<InvoicePrintViewProps> = ({ invoice }) => {
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
    <div className="print-only fixed inset-0 bg-white z-[9999] p-8">
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
              className="h-16 mb-3" 
            />
          )}
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {settings?.company_name || website?.name || 'Mon Restaurant'}
          </h1>
          {settings?.company_address && (
            <p className="text-gray-600 whitespace-pre-line">{settings.company_address}</p>
          )}
          {settings?.company_phone && (
            <p className="text-sm text-gray-500 mt-1">Tél: {settings.company_phone}</p>
          )}
          {settings?.company_email && (
            <p className="text-sm text-gray-500">{settings.company_email}</p>
          )}
          {settings?.tax_id && (
            <p className="text-sm text-gray-500">SIRET/TVA: {settings.tax_id}</p>
          )}
        </div>
        <div className="text-right">
          <h2 
            className="text-2xl font-bold text-gray-900 mb-2"
            style={{ color: settings?.primary_color || '#3B82F6' }}
          >
            {settings?.invoice_title || 'FACTURE'}
          </h2>
          <p 
            className="text-lg font-semibold"
            style={{ color: settings?.primary_color || '#3B82F6' }}
          >
            {invoice.invoice_number}
          </p>
          <p className="text-sm text-gray-600 mt-2">Date: {formatDate(invoice.created_at)}</p>
        </div>
      </div>

      {/* Informations client */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Facturé à:</h3>
        <p className="text-gray-700">
          {invoice.order?.customer_name || 'Client'}
        </p>
        {invoice.order?.customer_email && (
          <p className="text-sm text-gray-600">{invoice.order.customer_email}</p>
        )}
        {invoice.order?.customer_phone && (
          <p className="text-sm text-gray-600">{invoice.order.customer_phone}</p>
        )}
      </div>

      {/* Détails de la facture */}
      <div className="mb-8">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Description</th>
              <th className="border border-gray-300 px-4 py-3 text-right font-semibold">Montant</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 px-4 py-3">
                <p className="font-medium">Services et produits</p>
                {invoice.notes && (
                  <p className="text-sm text-gray-600 mt-1">{invoice.notes}</p>
                )}
              </td>
              <td className="border border-gray-300 px-4 py-3 text-right font-semibold">
                {invoice.total_amount.toLocaleString('fr-FR')} FCFA
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Total */}
      <div className="flex justify-end mb-12">
        <div className="w-64">
          <div className="flex justify-between py-2 border-t-2 border-gray-300">
            <span className="font-semibold text-gray-900">TOTAL:</span>
            <span 
              className="font-bold text-xl"
              style={{ color: settings?.primary_color || '#3B82F6' }}
            >
              {invoice.total_amount.toLocaleString('fr-FR')} FCFA
            </span>
          </div>
        </div>
      </div>

      {/* Informations de paiement */}
      <div className="mb-8 p-4 bg-gray-50 rounded">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Informations de paiement</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Statut:</p>
            <p className="font-semibold text-gray-900">
              {invoice.status === 'paid' ? 'PAYÉE' : 
               invoice.status === 'unpaid' ? 'EN ATTENTE' : 'EN RETARD'}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Date d'échéance:</p>
            <p className="font-semibold text-gray-900">{formatDate(invoice.due_date)}</p>
          </div>
          {invoice.paid_date && (
            <div>
              <p className="text-gray-600">Date de paiement:</p>
              <p className="font-semibold text-gray-900">{formatDate(invoice.paid_date)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Conditions */}
      <div className="border-t-2 border-gray-300 pt-6 mt-12">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Conditions de paiement:</h3>
        <p className="text-xs text-gray-600 mb-4 whitespace-pre-line">
          {settings?.payment_terms || 'Paiement à effectuer sous 30 jours à compter de la date de facturation.'}
        </p>
        {settings?.footer_note && (
          <p className="text-xs text-gray-600 mb-4 whitespace-pre-line">
            {settings.footer_note}
          </p>
        )}
        <p className="text-xs text-gray-500 text-center mt-8">
          {settings?.company_name || website?.name || 'Mon Restaurant'}
        </p>
      </div>
    </div>
  );
};

export default InvoicePrintView;
