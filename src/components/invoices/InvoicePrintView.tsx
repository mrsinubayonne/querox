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

  const primaryColor = settings?.primary_color || '#3B82F6';

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="print-only fixed inset-0 bg-white z-[9999] p-12">
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

      {/* En-tête moderne */}
      <div className="flex justify-between items-start mb-16">
        <div className="flex-1">
          {(settings?.logo_url || website?.logo_url) && (
            <img 
              src={settings?.logo_url || website?.logo_url} 
              alt="Logo" 
              className="h-20 mb-5 object-contain" 
            />
          )}
          <h1 className="text-4xl font-bold text-black mb-3">
            {settings?.company_name || website?.name || 'Mon Restaurant'}
          </h1>
          <div className="space-y-1">
            {settings?.company_address && (
              <p className="text-base text-black leading-relaxed">{settings.company_address}</p>
            )}
            <div className="flex gap-6 text-base text-black mt-2">
              {settings?.company_phone && <span>📞 {settings.company_phone}</span>}
              {settings?.company_email && <span>✉ {settings.company_email}</span>}
            </div>
            {settings?.tax_id && (
              <p className="text-sm text-black mt-2">SIRET/TVA: {settings.tax_id}</p>
            )}
          </div>
        </div>
        
        <div className="text-right">
          <div 
            className="inline-block px-8 py-4 rounded-xl mb-4"
            style={{ backgroundColor: primaryColor }}
          >
            <h2 className="text-3xl font-bold text-white">
              {settings?.invoice_title || 'FACTURE'}
            </h2>
          </div>
          <div className="bg-gray-100 p-5 rounded-xl">
            <p className="text-xs text-black mb-2 uppercase tracking-wide">Numéro</p>
            <p className="text-2xl font-bold text-black">{invoice.invoice_number}</p>
            <p className="text-sm text-black mt-3">
              {formatDate(invoice.created_at)}
            </p>
          </div>
        </div>
      </div>

      {/* Informations client */}
      <div className="bg-gray-50 p-6 rounded-xl mb-10">
        <h3 className="text-sm font-semibold text-black mb-3 uppercase tracking-wide">Facturé à</h3>
        <p className="text-xl font-bold text-black">
          {invoice.order?.customer_name || 'Client'}
        </p>
        {invoice.order?.customer_email && (
          <p className="text-base text-black mt-1">{invoice.order.customer_email}</p>
        )}
        {invoice.order?.customer_phone && (
          <p className="text-base text-black">{invoice.order.customer_phone}</p>
        )}
        {servedBy && (
          <p className="text-base text-black mt-3">
            <span className="font-semibold">Servi par:</span> {servedBy}
          </p>
        )}
      </div>

      {/* Tableau des articles */}
      <div className="mb-10">
        <div className="overflow-hidden rounded-xl border-2 border-gray-200">
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: primaryColor }}>
                <th className="px-8 py-5 text-left text-base font-bold text-white">Article</th>
                <th className="px-8 py-5 text-center text-base font-bold text-white">Qté</th>
                <th className="px-8 py-5 text-right text-base font-bold text-white">P.U.</th>
                <th className="px-8 py-5 text-right text-base font-bold text-white">Total</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {invoice.order?.items && Array.isArray(invoice.order.items) && invoice.order.items.length > 0 ? (
                invoice.order.items.map((item: any, index: number) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="px-8 py-5">
                      <p className="text-lg font-semibold text-black">{item.name}</p>
                    </td>
                    <td className="px-8 py-5 text-center text-lg font-semibold text-black">
                      {item.quantity}
                    </td>
                    <td className="px-8 py-5 text-right text-lg text-black">
                      {item.price?.toLocaleString('fr-FR')} FCFA
                    </td>
                    <td className="px-8 py-5 text-right text-xl font-bold text-black">
                      {((item.price || 0) * (item.quantity || 0)).toLocaleString('fr-FR')} FCFA
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="border-b border-gray-200">
                  <td colSpan={4} className="px-8 py-6">
                    <p className="text-lg font-semibold text-black">Services et produits</p>
                    {invoice.notes && (
                      <p className="text-base text-black mt-2">{invoice.notes}</p>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Total */}
      <div className="flex justify-end mb-12">
        <div className="w-96">
          <div 
            className="p-8 rounded-xl text-white"
            style={{ backgroundColor: primaryColor }}
          >
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold">MONTANT TOTAL</span>
              <span className="text-4xl font-bold">
                {invoice.total_amount.toLocaleString('fr-FR')} FCFA
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Informations de paiement */}
      <div className="grid grid-cols-2 gap-8 mb-10">
        <div className="bg-gray-50 p-6 rounded-xl">
          <p className="text-sm text-black mb-2 uppercase tracking-wide">Statut du paiement</p>
          <p className="text-2xl font-bold text-black">
            {invoice.status === 'paid' ? 'PAYÉE' : 
             invoice.status === 'unpaid' ? 'EN ATTENTE' : 'EN RETARD'}
          </p>
        </div>
        {invoice.paid_date && (
          <div className="bg-gray-50 p-6 rounded-xl">
            <p className="text-sm text-black mb-2 uppercase tracking-wide">Date de paiement</p>
            <p className="text-2xl font-bold text-black">{formatDate(invoice.paid_date)}</p>
          </div>
        )}
      </div>

      {/* Conditions de paiement */}
      {settings?.payment_terms && (
        <div className="border-t-2 pt-6 mb-6">
          <h3 className="text-sm font-semibold text-black mb-3 uppercase tracking-wide">
            Conditions de paiement
          </h3>
          <p className="text-base text-black leading-relaxed">
            {settings.payment_terms}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="text-center mt-12 pt-8 border-t-2">
        {settings?.footer_note && (
          <p className="text-base text-black mb-4 leading-relaxed">
            {settings.footer_note}
          </p>
        )}
        <p className="text-sm text-black font-semibold">
          Généré par QUEROX - Logiciel de gestion, automatisation et optimisation
        </p>
      </div>
    </div>
  );
};

export default InvoicePrintView;
