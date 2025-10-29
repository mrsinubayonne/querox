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

  const total = invoice.total_amount;

  return (
    <div className="print-only fixed inset-0 bg-white z-[9999] p-16">
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

      {/* En-tête avec logo et titre FACTURE */}
      <div className="flex justify-between items-start mb-16">
        <div>
          {(settings?.logo_url || website?.logo_url) && (
            <img 
              src={settings?.logo_url || website?.logo_url} 
              alt="Logo" 
              className="h-20 mb-3 object-contain" 
            />
          )}
          {(settings?.company_name || website?.name) && (
            <h1 className="text-2xl font-bold text-black uppercase tracking-wide">
              {settings?.company_name || website?.name}
            </h1>
          )}
        </div>
        <div>
          <h2 className="text-7xl font-bold text-black uppercase tracking-tight">
            {settings?.invoice_title || 'FACTURE'}
          </h2>
        </div>
      </div>

      {/* Date et Numéro de facture */}
      <div className="flex justify-between items-start mb-12 pb-8 border-b-2 border-black">
        <div>
          <p className="text-base font-bold text-black uppercase">
            DATE : {formatDate(invoice.created_at)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-base font-bold text-black uppercase">
            FACTURE N° : {invoice.invoice_number}
          </p>
        </div>
      </div>

      {/* Émetteur et Destinataire */}
      <div className="flex justify-between mb-16">
        <div className="w-5/12">
          <h3 className="text-base font-bold text-black mb-4 uppercase">ÉMETTEUR :</h3>
          {settings?.company_phone && (
            <p className="text-base text-black mb-2">{settings.company_phone}</p>
          )}
          {settings?.company_email && (
            <p className="text-base text-black mb-2">{settings.company_email}</p>
          )}
          {settings?.company_address && (
            <p className="text-base text-black whitespace-pre-line">{settings.company_address}</p>
          )}
        </div>
        <div className="w-5/12 text-right">
          <h3 className="text-base font-bold text-black mb-4 uppercase">DESTINATAIRE :</h3>
          <p className="text-base font-bold text-black mb-2">
            {invoice.order?.customer_name || 'Client'}
          </p>
          {invoice.order?.customer_email && (
            <p className="text-base text-black mb-2">{invoice.order.customer_email}</p>
          )}
          {invoice.order?.customer_phone && (
            <p className="text-base text-black mb-2">{invoice.order.customer_phone}</p>
          )}
          {servedBy && (
            <p className="text-base text-black mt-3">Servi par: {servedBy}</p>
          )}
        </div>
      </div>

      {/* Tableau des articles */}
      <div className="mb-12">
        <div className="border-b-2 border-black mb-3">
          <div className="grid grid-cols-12 gap-4 pb-3">
            <div className="col-span-6">
              <p className="text-base font-bold text-black uppercase">Description :</p>
            </div>
            <div className="col-span-2 text-right">
              <p className="text-base font-bold text-black uppercase">Prix Unitaire :</p>
            </div>
            <div className="col-span-2 text-center">
              <p className="text-base font-bold text-black uppercase">Quantité :</p>
            </div>
            <div className="col-span-2 text-right">
              <p className="text-base font-bold text-black uppercase">Total :</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-0">
          {invoice.order?.items && Array.isArray(invoice.order.items) && invoice.order.items.length > 0 ? (
            <>
              {invoice.order.items.map((item: any, index: number) => (
                <div key={index} className="grid grid-cols-12 gap-4 py-5 border-b border-black">
                  <div className="col-span-6">
                    <p className="text-base text-black">{item.name}</p>
                  </div>
                  <div className="col-span-2 text-right">
                    <p className="text-base text-black">{item.price?.toLocaleString('fr-FR')} FCFA</p>
                  </div>
                  <div className="col-span-2 text-center">
                    <p className="text-base text-black">{item.quantity}</p>
                  </div>
                  <div className="col-span-2 text-right">
                    <p className="text-base text-black">
                      {((item.price || 0) * (item.quantity || 0)).toLocaleString('fr-FR')} FCFA
                    </p>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="grid grid-cols-12 gap-4 py-5 border-b border-black">
              <div className="col-span-6">
                <p className="text-base text-black">Services et produits</p>
              </div>
              <div className="col-span-2 text-right">
                <p className="text-base text-black">{total.toLocaleString('fr-FR')} FCFA</p>
              </div>
              <div className="col-span-2 text-center">
                <p className="text-base text-black">1</p>
              </div>
              <div className="col-span-2 text-right">
                <p className="text-base text-black">{total.toLocaleString('fr-FR')} FCFA</p>
              </div>
            </div>
          )}
          
          {/* Lignes vides pour l'espacement */}
          <div className="grid grid-cols-12 gap-4 py-5 border-b border-black">
            <div className="col-span-6"><p className="text-base text-black">-</p></div>
            <div className="col-span-2 text-right"><p className="text-base text-black">-</p></div>
            <div className="col-span-2 text-center"><p className="text-base text-black">-</p></div>
            <div className="col-span-2 text-right"><p className="text-base text-black">-</p></div>
          </div>
        </div>
      </div>

      {/* Section Totaux */}
      <div className="flex justify-end">
        <div className="w-5/12">
          <div className="space-y-3">
            <div className="flex justify-between pt-3 border-t-2 border-black">
              <p className="text-lg font-bold text-black uppercase">TOTAL :</p>
              <p className="text-lg font-bold text-black">{total.toLocaleString('fr-FR')} FCFA</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePrintView;
