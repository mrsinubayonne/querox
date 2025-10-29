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

      <div className="relative max-w-2xl mx-auto p-8 border-4 border-black" style={{
        borderImage: 'repeating-linear-gradient(45deg, #000 0, #000 10px, transparent 10px, transparent 20px) 4'
      }}>
        {/* Decorative corner elements */}
        <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-black"></div>
        <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-black"></div>
        <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-black"></div>
        <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-black"></div>
        
        {/* Decorative dots */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex gap-1">
          <div className="w-1 h-1 bg-black rounded-full"></div>
          <div className="w-1 h-1 bg-black rounded-full"></div>
          <div className="w-1 h-1 bg-black rounded-full"></div>
          <div className="w-1 h-1 bg-black rounded-full"></div>
          <div className="w-1 h-1 bg-black rounded-full"></div>
        </div>
        
        <div className="relative z-10">
          {/* Logo centré */}
          <div className="text-center mb-4">
            {(settings?.logo_url || website?.logo_url) && (
              <img 
                src={settings?.logo_url || website?.logo_url} 
                alt="Logo" 
                className="h-16 mx-auto mb-2 object-contain" 
              />
            )}
            {(settings?.company_name || website?.name) && (
              <>
                <h1 className="text-2xl font-bold text-black uppercase tracking-wider mb-1">
                  {settings?.company_name || website?.name}
                </h1>
                <p className="text-xs text-black uppercase tracking-wide">
                  {settings?.payment_terms || 'CUISINE GASTRONOMIQUE'}
                </p>
              </>
            )}
          </div>

          {/* Date et Numéro de facture */}
          <div className="flex justify-between items-center mb-6 text-xs">
            <div className="text-black">
              {formatDate(invoice.created_at).replace(/\s\/\s/g, '.')}
            </div>
            <div className="text-black font-bold uppercase">
              INVOICE #{invoice.invoice_number}
            </div>
          </div>

          {/* En-têtes du tableau */}
          <div className="grid grid-cols-12 gap-2 mb-2 pb-2 border-b border-black">
            <div className="col-span-2 text-xs font-bold text-black uppercase">
              QUANTITÉ
            </div>
            <div className="col-span-7 text-xs font-bold text-black uppercase">
              ARTICLE
            </div>
            <div className="col-span-3 text-xs font-bold text-black text-right uppercase">
              PRIX (FCFA)
            </div>
          </div>

          {/* Articles */}
          <div className="space-y-3 mb-6">
            {invoice.order?.items && Array.isArray(invoice.order.items) && invoice.order.items.length > 0 ? (
              invoice.order.items.map((item: any, index: number) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-start">
                  <div className="col-span-2 text-sm text-black font-bold">
                    {item.quantity}
                  </div>
                  <div className="col-span-7">
                    <p className="text-sm font-bold text-black uppercase">{item.name}</p>
                    {item.description && (
                      <p className="text-xs text-black">({item.description})</p>
                    )}
                  </div>
                  <div className="col-span-3 text-sm text-black text-right">
                    {((item.price || 0) * (item.quantity || 0)).toLocaleString('fr-FR')}
                  </div>
                </div>
              ))
            ) : (
              <>
                <div className="grid grid-cols-12 gap-2 items-start">
                  <div className="col-span-2 text-sm text-black font-bold">1</div>
                  <div className="col-span-7">
                    <p className="text-sm font-bold text-black uppercase">SERVICE</p>
                    <p className="text-xs text-black">(Prestations)</p>
                  </div>
                  <div className="col-span-3 text-sm text-black text-right">
                    {totalHT.toLocaleString('fr-FR')}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Totaux */}
          <div className="border-t border-black pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-black uppercase">Subtotal</span>
              <span className="text-black">{totalHT.toLocaleString('fr-FR')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-black uppercase">Service Charge (10%)</span>
              <span className="text-black">{(totalHT * 0.1).toLocaleString('fr-FR')}</span>
            </div>
            <div className="flex justify-between text-base font-bold border-t border-black pt-2">
              <span className="text-black uppercase">Total Dû</span>
              <span className="text-black">{(totalHT * 1.1).toLocaleString('fr-FR')}</span>
            </div>
          </div>

          {/* QR Code et message de remerciement */}
          <div className="mt-6 flex items-end justify-between">
            <div className="w-16 h-16 bg-black flex items-center justify-center text-white text-[8px] leading-tight p-1">
              QR CODE
            </div>
            <div className="text-right">
              <p className="text-[10px] text-black italic">
                {settings?.footer_note || "MERCI D'AVOIR DÎNÉ AU BORD DE L'UNIVERS"}
              </p>
              {servedBy && (
                <p className="text-[10px] text-black mt-1">Servi par: {servedBy}</p>
              )}
            </div>
          </div>

          {/* Decorative dots bottom */}
          <div className="flex justify-center gap-1 mt-4">
            <div className="w-1 h-1 bg-black rounded-full"></div>
            <div className="w-1 h-1 bg-black rounded-full"></div>
            <div className="w-1 h-1 bg-black rounded-full"></div>
            <div className="w-1 h-1 bg-black rounded-full"></div>
            <div className="w-1 h-1 bg-black rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePrintView;
