import React, { useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { createPortal } from 'react-dom';
import { Invoice } from '@/hooks/useInvoices';
import { supabase } from '@/integrations/supabase/client';
import { InvoiceSettings } from '@/hooks/useInvoiceSettings';
import { getData } from '@/lib/offlineStorage';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { InvoiceDisplayOptions, DEFAULT_DISPLAY_OPTIONS } from '@/types/invoiceDisplayOptions';

interface InvoicePrintViewProps {
  invoice: Invoice;
  servedBy?: string;
  format?: 'a4' | 'restaurant';
  autoPrint?: boolean;
  onReady?: () => void;
}

interface OutletData {
  name: string;
  address: string | null;
  phone: string | null;
}

export interface InvoicePrintViewRef {
  print: () => void;
}

const InvoicePrintView = forwardRef<InvoicePrintViewRef, InvoicePrintViewProps>(
  ({ invoice, servedBy, format = 'restaurant', autoPrint = false, onReady }, ref) => {
    const [settings, setSettings] = useState<InvoiceSettings | null>(null);
    const [outlet, setOutlet] = useState<OutletData | null>(null);
    const [dataLoaded, setDataLoaded] = useState(false);
    const { isOffline } = useNetworkStatus();

    // Expose print method via ref
    useImperativeHandle(ref, () => ({
      print: () => {
        if (dataLoaded) {
          window.print();
        }
      },
    }));

    useEffect(() => {
      const fetchInvoiceData = async () => {
        console.log('🔍 Fetching invoice data for:', {
          outlet_id: invoice.outlet_id,
          user_id: invoice.user_id,
          isOffline,
        });

        // Try loading from cache first if offline
        if (isOffline) {
          try {
            const cachedSettings = await getData<InvoiceSettings[]>('invoice_settings', invoice.user_id, invoice.outlet_id || undefined);
            if (cachedSettings?.data && cachedSettings.data.length > 0) {
              setSettings(cachedSettings.data[0]);
            }
            const cachedOutlets = await getData<OutletData[]>('outlets', invoice.user_id);
            if (cachedOutlets?.data && invoice.outlet_id) {
              const o = cachedOutlets.data.find((x: any) => x.id === invoice.outlet_id);
              if (o) setOutlet(o);
            }
          } catch (e) {
            console.warn('Failed to load print data from cache:', e);
          }
          setDataLoaded(true);
          return;
        }

        // Online: fetch from Supabase
        if (invoice.outlet_id) {
          const { data: outletData, error: outletError } = await supabase
            .from('outlets')
            .select('name, address, phone')
            .eq('id', invoice.outlet_id)
            .single();

          console.log('📍 Outlet data:', outletData, 'Error:', outletError);
          setOutlet(outletData);
        }

        let settingsData = null;

        if (invoice.outlet_id) {
          const result = await supabase
            .from('invoice_settings')
            .select('*')
            .eq('user_id', invoice.user_id)
            .eq('outlet_id', invoice.outlet_id)
            .maybeSingle();

          settingsData = result.data;
          console.log('🔍 Outlet-specific settings:', settingsData);
        }

        if (!settingsData) {
          console.log('⚠️ No outlet-specific settings, trying global settings...');
          const globalResult = await supabase
            .from('invoice_settings')
            .select('*')
            .eq('user_id', invoice.user_id)
            .is('outlet_id', null)
            .maybeSingle();

          settingsData = globalResult.data;
          console.log('🔍 Global settings result:', settingsData);
        }

        if (!settingsData) {
          console.log('⚠️ No global settings, trying any user settings...');
          const anyResult = await supabase
            .from('invoice_settings')
            .select('*')
            .eq('user_id', invoice.user_id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          settingsData = anyResult.data;
          console.log('🔍 Any user settings result:', settingsData);
        }

        console.log('⚙️ Final settings data:', settingsData);
        setSettings(settingsData);

        setDataLoaded(true);
      };

      fetchInvoiceData();
    }, [invoice.outlet_id, invoice.user_id, isOffline]);

    // Notify parent when ready
    useEffect(() => {
      if (dataLoaded) {
        console.log('✅ Invoice print data loaded');
        onReady?.();
      }
    }, [dataLoaded, onReady]);

    // Auto-print only if explicitly requested
    useEffect(() => {
      if (dataLoaded && autoPrint) {
        console.log('✅ Data loaded, triggering auto-print...');
        const timer = setTimeout(() => {
          window.print();
        }, 300);

        return () => clearTimeout(timer);
      }
    }, [dataLoaded, autoPrint]);

    const formatDate = (dateString: string | null) => {
      if (!dateString) return '-';
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    };

    const opts: InvoiceDisplayOptions = { ...DEFAULT_DISPLAY_OPTIONS, ...((settings as any)?.display_options || {}) };

    // Create a portal that attaches directly to the body for printing
    return createPortal(
      <div
        id="invoice-print-portal"
        className="invoice-print-container"
        style={{ fontFamily: 'Arial, sans-serif', fontWeight: '600' }}
      >
        <style>{`
          /* Hide everything except the invoice during print */
          @media print {
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              width: ${format === 'a4' ? '210mm' : '80mm'} !important;
              min-width: ${format === 'a4' ? '210mm' : '80mm'} !important;
              max-width: ${format === 'a4' ? '210mm' : '80mm'} !important;
              height: auto !important;
              min-height: 0 !important;
              background: white !important;
              -webkit-text-size-adjust: 100% !important;
              text-size-adjust: 100% !important;
            }
            /* Remove every other root element from the page flow so only
               the invoice is measured for pagination (avoids extra blank pages) */
            body > *:not(#invoice-print-portal) {
              display: none !important;
            }
            #invoice-print-portal,
            #invoice-print-portal * {
              visibility: visible !important;
            }
            #invoice-print-portal {
              position: static !important;
              left: auto !important;
              top: auto !important;
              display: block !important;
              width: ${format === 'a4' ? '210mm' : '80mm'} !important;
              max-width: ${format === 'a4' ? '210mm' : '80mm'} !important;
              background: white !important;
              margin: 0 !important;
              padding: 0 !important;
              page-break-after: avoid !important;
            }
            .invoice-print-container {
              padding: ${format === 'a4' ? '15mm' : '2mm'} !important;
              width: ${format === 'a4' ? '210mm' : '76mm'} !important;
              max-width: ${format === 'a4' ? '210mm' : '76mm'} !important;
              height: auto !important;
              overflow: visible !important;
              margin: 0 !important;
              page-break-after: avoid !important;
            }
            @page {
              size: ${format === 'a4' ? 'A4 portrait' : '80mm auto'};
              margin: ${format === 'a4' ? '10mm' : '0mm'};
            }
            /* Font sizes for thermal receipt */
            .invoice-print-container {
              font-size: ${format === 'a4' ? '11pt' : '12pt'} !important;
              -webkit-text-size-adjust: 100% !important;
              text-size-adjust: 100% !important;
              line-height: 1.3 !important;
            }
            .invoice-print-container table {
              font-size: inherit !important;
              width: 100% !important;
            }
            .invoice-print-container td,
            .invoice-print-container th {
              font-size: ${format === 'a4' ? '10pt' : '11pt'} !important;
              padding: ${format === 'a4' ? '4px' : '2px 1px'} !important;
            }
            .invoice-print-container h1 {
              font-size: ${format === 'a4' ? '18pt' : '14pt'} !important;
            }
            .invoice-print-container h2 {
              font-size: ${format === 'a4' ? '16pt' : '13pt'} !important;
            }
            .invoice-print-container p,
            .invoice-print-container span {
              font-size: ${format === 'a4' ? '10pt' : '11pt'} !important;
            }
            /* Allow page breaks in the table */
            table { page-break-inside: auto !important; }
            tr { page-break-inside: avoid !important; page-break-after: auto !important; }
            thead { display: table-header-group !important; }
            tfoot { display: table-footer-group !important; }
            /* Avoid page breaks in header and footer */
            .invoice-header { page-break-inside: avoid !important; }
            .invoice-footer { page-break-inside: avoid !important; }
            /* Anti-blank-page rules: never force a break after the invoice
               or any of its descendants, and collapse trailing whitespace. */
            #invoice-print-portal,
            #invoice-print-portal *,
            .invoice-print-container,
            .invoice-print-container * {
              page-break-after: avoid !important;
              break-after: avoid-page !important;
            }
            #invoice-print-portal > *:last-child,
            .invoice-print-container > *:last-child {
              margin-bottom: 0 !important;
              padding-bottom: 0 !important;
              page-break-after: avoid !important;
              break-after: avoid-page !important;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              font-family: 'Arial', sans-serif !important;
              font-weight: 600 !important;
            }
          }
          @media screen {
            #invoice-print-portal {
              position: fixed !important;
              left: -99999px !important;
              top: -99999px !important;
              width: 1px !important;
              height: 1px !important;
              overflow: hidden !important;
              opacity: 0 !important;
              pointer-events: none !important;
            }
          }
        `}</style>

        {/* Header */}
        <div className="invoice-header flex justify-between items-start mb-2 pb-1 border-b border-gray-300">
          <div>
            {opts.show_logo && settings?.logo_url && <img src={settings.logo_url} alt="Logo" className="h-12 mb-1" />}
            <h1 className="text-xl font-bold text-black mb-0">
              {settings?.company_name || outlet?.name || 'Mon Restaurant'}
            </h1>
            {opts.show_company_address && settings?.company_address && (
              <p className="text-xs text-black whitespace-pre-line">{settings.company_address}</p>
            )}
            {opts.show_company_address && !settings?.company_address && outlet?.address && (
              <p className="text-xs text-black whitespace-pre-line">{outlet.address}</p>
            )}
            {opts.show_company_phone && settings?.company_phone && <p className="text-xs text-black">Tél: {settings.company_phone}</p>}
            {opts.show_company_phone && !settings?.company_phone && outlet?.phone && (
              <p className="text-xs text-black">Tél: {outlet.phone}</p>
            )}
            {opts.show_company_email && settings?.company_email && <p className="text-xs text-black">{settings.company_email}</p>}
            {opts.show_tax_id && settings?.tax_id && <p className="text-xs text-black">SIRET/TVA: {settings.tax_id}</p>}
            {opts.show_nif && (settings as any)?.nif_number && (
              <p className="text-xs text-black">NIU: {(settings as any).nif_number}</p>
            )}
            {opts.show_rccm && (settings as any)?.rccm_number && (
              <p className="text-xs text-black">RCCM: {(settings as any).rccm_number}</p>
            )}
            {opts.show_other_registration && (settings as any)?.other_registration && (
              <p className="text-xs text-black">{(settings as any).other_registration}</p>
            )}
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold mb-0 text-black">{settings?.invoice_title || 'FACTURE'}</h2>
            {opts.show_invoice_number && (
              <p className="text-base text-black font-semibold">{invoice.invoice_number}</p>
            )}
            {opts.show_date && (
              <p className="text-xs text-black">Date: {formatDate(invoice.created_at)}</p>
            )}
          </div>
        </div>

        {/* Customer info */}
        {opts.show_customer_info && (
          <div className="mb-2">
            <h3 className="text-sm font-bold text-black mb-0">Facturé à:</h3>
            <p className="text-xs text-black font-semibold">{invoice.customer_name || 'Client'}</p>
            {invoice.customer_email && <p className="text-xs text-black">{invoice.customer_email}</p>}
            {invoice.customer_phone && <p className="text-xs text-black">{invoice.customer_phone}</p>}
          </div>
        )}
        {opts.show_served_by && servedBy && <p className="text-xs text-black mb-2">Servi par: {servedBy}</p>}

        {/* Invoice items */}
        <div className="mb-2">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-1 py-1 text-left text-xs font-semibold">Article</th>
                <th className="border border-gray-300 px-1 py-1 text-center text-xs font-semibold">Qté</th>
                <th className="border border-gray-300 px-1 py-1 text-right text-xs font-semibold">P.U.</th>
                <th className="border border-gray-300 px-1 py-1 text-right text-xs font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items && Array.isArray(invoice.items) && invoice.items.length > 0 ? (
                invoice.items.map((item: any, index: number) => (
                  <tr key={index}>
                    <td className="border border-gray-300 px-1 py-1">
                      <p className="text-xs">{item.name}</p>
                    </td>
                    <td className="border border-gray-300 px-1 py-1 text-center text-xs">{item.quantity}</td>
                    <td className="border border-gray-300 px-1 py-1 text-right text-xs">
                      {item.price?.toLocaleString('fr-FR')} XAF
                    </td>
                    <td className="border border-gray-300 px-1 py-1 text-right text-xs font-semibold">
                      {((item.price || 0) * (item.quantity || 0)).toLocaleString('fr-FR')} XAF
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="border border-gray-300 px-1 py-1">
                    <p className="text-xs text-black">Services et produits</p>
                    {invoice.notes && <p className="text-xs text-black">{invoice.notes}</p>}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Total */}
        <div className="flex justify-end mb-2">
          <div className="w-48">
            <div className="flex justify-between py-1 border-t-2 border-gray-300">
              <span className="text-base text-black font-bold">TOTAL:</span>
              <span className="text-base text-black font-bold">
                {invoice.total_amount.toLocaleString('fr-FR')} XAF
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="invoice-footer border-t border-gray-300 pt-2 mt-2">
          {opts.show_footer_note && settings?.footer_note && (
            <p className="text-xs text-black mb-1 whitespace-pre-line">{settings.footer_note}</p>
          )}
          {opts.show_querox_branding && (
            <p className="text-xs text-black text-center" style={{ fontFamily: 'Arial, sans-serif', fontStyle: 'italic' }}>
              Généré par QUEROX.me - Logiciel de gestion, automatisation et optimisation
            </p>
          )}
        </div>
      </div>,
      document.body
    );
  }
);

InvoicePrintView.displayName = 'InvoicePrintView';

export default InvoicePrintView;
