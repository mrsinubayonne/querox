import React, { useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { createPortal } from 'react-dom';
import { Invoice } from '@/hooks/useInvoices';
import { supabase } from '@/integrations/supabase/client';
import { InvoiceSettings } from '@/hooks/useInvoiceSettings';
import { getData } from '@/lib/offlineStorage';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { InvoiceDisplayOptions, DEFAULT_DISPLAY_OPTIONS, DEFAULT_STYLE_OPTIONS, formatInvoiceDate } from '@/types/invoiceDisplayOptions';

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

    const opts: InvoiceDisplayOptions = { ...DEFAULT_DISPLAY_OPTIONS, ...((settings as any)?.display_options || {}) };
    const style = { ...DEFAULT_STYLE_OPTIONS, ...(opts.style || {}) };
    const formatDate = (dateString: string | null) => formatInvoiceDate(dateString, style.date_format);
    const titleText = style.uppercase_title
      ? (settings?.invoice_title || 'FACTURE').toUpperCase()
      : (settings?.invoice_title || 'FACTURE');

    // Helpers: convert px (editor) -> pt (print) — 1pt ≈ 1.333px
    const pxToPt = (px: number) => Math.max(6, Math.round(px * 0.75));
    const fsTitle = pxToPt(style.font_size_title);
    const fsBody = pxToPt(style.font_size_body);
    const fsSmall = pxToPt(style.font_size_small);
    const fsTotal = pxToPt(style.font_size_total);
    const fsCompany = pxToPt(style.font_size_company);
    const accent = style.accent_color || settings?.primary_color || '#000000';
    const textColor = style.text_color || '#000000';
    const fontFamily = (style as any).font_family || 'Arial, sans-serif';
    const fontWeight = (style as any).body_bold ? 700 : 500;

    return createPortal(
      <div
        id="invoice-print-portal"
        className="invoice-print-container"
        style={{ fontFamily, fontWeight, color: textColor, fontSize: `${style.font_size_body}px` }}
      >
        <style>{`
          @media print {
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              width: ${format === 'a4' ? '210mm' : '80mm'} !important;
              min-width: ${format === 'a4' ? '210mm' : '80mm'} !important;
              max-width: ${format === 'a4' ? '210mm' : '80mm'} !important;
              background: white !important;
            }
            body > *:not(#invoice-print-portal) { display: none !important; }
            #invoice-print-portal, #invoice-print-portal * {
              visibility: visible !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
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
              font-family: ${fontFamily} !important;
              color: ${textColor} !important;
            }
            .invoice-print-container {
              padding: ${format === 'a4' ? '15mm' : '2mm'} !important;
              width: ${format === 'a4' ? '210mm' : '76mm'} !important;
              max-width: ${format === 'a4' ? '210mm' : '76mm'} !important;
              font-size: ${fsBody}pt !important;
              line-height: 1.3 !important;
            }
            @page {
              size: ${format === 'a4' ? 'A4 portrait' : '80mm auto'};
              margin: ${format === 'a4' ? '10mm' : '0mm'};
            }
            table { page-break-inside: auto !important; width: 100% !important; }
            tr { page-break-inside: avoid !important; }
            thead { display: table-header-group !important; }
            .invoice-header, .invoice-footer { page-break-inside: avoid !important; }
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

        <div
          className="invoice-header"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: style.section_spacing,
            paddingBottom: 6,
            borderBottom: `2px solid ${accent}`,
            gap: 12,
          }}
        >
          <div style={{ textAlign: style.company_align, flex: 1 }}>
            {opts.show_logo && settings?.logo_url && <img src={settings.logo_url} alt="Logo" style={{ height: 40, marginBottom: 4 }} />}
            <h1 style={{ fontSize: `${fsCompany}pt`, fontWeight: style.company_bold ? 700 : 400, margin: 0, color: textColor }}>
              {settings?.company_name || outlet?.name || 'Mon Restaurant'}
            </h1>
            {opts.show_company_address && (settings?.company_address || outlet?.address) && (
              <p style={{ fontSize: `${fsSmall}pt`, whiteSpace: 'pre-line', margin: '2px 0' }}>
                {settings?.company_address || outlet?.address}
              </p>
            )}
            {opts.show_company_phone && (settings?.company_phone || outlet?.phone) && (
              <p style={{ fontSize: `${fsSmall}pt`, margin: '2px 0' }}>Tél: {settings?.company_phone || outlet?.phone}</p>
            )}
            {opts.show_company_email && settings?.company_email && (
              <p style={{ fontSize: `${fsSmall}pt`, margin: '2px 0' }}>{settings.company_email}</p>
            )}
            {opts.show_tax_id && settings?.tax_id && (
              <p style={{ fontSize: `${fsSmall}pt`, margin: '2px 0' }}>SIRET/TVA: {settings.tax_id}</p>
            )}
            {opts.show_nif && (settings as any)?.nif_number && (
              <p style={{ fontSize: `${fsSmall}pt`, margin: '2px 0' }}>NIU: {(settings as any).nif_number}</p>
            )}
            {opts.show_rccm && (settings as any)?.rccm_number && (
              <p style={{ fontSize: `${fsSmall}pt`, margin: '2px 0' }}>RCCM: {(settings as any).rccm_number}</p>
            )}
            {opts.show_other_registration && (settings as any)?.other_registration && (
              <p style={{ fontSize: `${fsSmall}pt`, margin: '2px 0' }}>{(settings as any).other_registration}</p>
            )}
          </div>
          <div style={{ textAlign: style.header_align, flex: 1 }}>
            <h2
              style={{
                margin: 0,
                color: textColor,
                fontSize: `${fsTitle}pt`,
                fontWeight: style.title_bold ? 700 : 400,
                fontStyle: style.title_italic ? 'italic' : 'normal',
              }}
            >
              {titleText}
            </h2>
            {opts.show_invoice_number && (
              <p style={{ color: textColor, fontSize: `${fsBody}pt`, fontWeight: 600, margin: '2px 0' }}>
                {invoice.invoice_number}
              </p>
            )}
            {opts.show_date && (
              <p style={{ color: textColor, fontSize: `${fsSmall}pt`, margin: '2px 0' }}>
                Date: {formatDate(invoice.created_at)}
              </p>
            )}
          </div>
        </div>

        {opts.show_customer_info && (
          <div style={{ marginBottom: style.section_spacing }}>
            <h3 style={{ fontSize: `${fsBody}pt`, fontWeight: 700, margin: 0 }}>Facturé à:</h3>
            <p style={{ fontSize: `${fsBody}pt`, fontWeight: 600, margin: '2px 0' }}>{invoice.customer_name || 'Client'}</p>
            {invoice.customer_email && <p style={{ fontSize: `${fsSmall}pt`, margin: '2px 0' }}>{invoice.customer_email}</p>}
            {invoice.customer_phone && <p style={{ fontSize: `${fsSmall}pt`, margin: '2px 0' }}>{invoice.customer_phone}</p>}
          </div>
        )}
        {opts.show_served_by && servedBy && (
          <p style={{ fontSize: `${fsSmall}pt`, marginBottom: style.section_spacing }}>Servi par: {servedBy}</p>
        )}

        <div style={{ marginBottom: style.section_spacing }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f3f4f6' }}>
                <th style={{ border: '1px solid #d1d5db', padding: '4px', textAlign: 'left', fontSize: `${fsSmall}pt`, fontWeight: 700 }}>Article</th>
                <th style={{ border: '1px solid #d1d5db', padding: '4px', textAlign: 'center', fontSize: `${fsSmall}pt`, fontWeight: 700 }}>Qté</th>
                <th style={{ border: '1px solid #d1d5db', padding: '4px', textAlign: 'right', fontSize: `${fsSmall}pt`, fontWeight: 700 }}>P.U.</th>
                <th style={{ border: '1px solid #d1d5db', padding: '4px', textAlign: 'right', fontSize: `${fsSmall}pt`, fontWeight: 700 }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items && Array.isArray(invoice.items) && invoice.items.length > 0 ? (
                invoice.items.map((item: any, index: number) => (
                  <tr key={index}>
                    <td style={{ border: '1px solid #d1d5db', padding: '4px', fontSize: `${fsSmall}pt` }}>{item.name}</td>
                    <td style={{ border: '1px solid #d1d5db', padding: '4px', textAlign: 'center', fontSize: `${fsSmall}pt` }}>{item.quantity}</td>
                    <td style={{ border: '1px solid #d1d5db', padding: '4px', textAlign: 'right', fontSize: `${fsSmall}pt` }}>
                      {item.price?.toLocaleString('fr-FR')} XAF
                    </td>
                    <td style={{ border: '1px solid #d1d5db', padding: '4px', textAlign: 'right', fontSize: `${fsSmall}pt`, fontWeight: 700 }}>
                      {((item.price || 0) * (item.quantity || 0)).toLocaleString('fr-FR')} XAF
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} style={{ border: '1px solid #d1d5db', padding: '4px', fontSize: `${fsSmall}pt` }}>
                    Services et produits
                    {invoice.notes && <div>{invoice.notes}</div>}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: style.total_align === 'left' ? 'flex-start' : style.total_align === 'center' ? 'center' : 'flex-end',
            marginBottom: style.section_spacing,
          }}
        >
          <div style={{ minWidth: 200 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 4, borderTop: `2px solid ${accent}` }}>
              <span style={{ fontSize: `${fsTotal}pt`, fontWeight: 700 }}>TOTAL:</span>
              <span style={{ fontSize: `${fsTotal}pt`, fontWeight: style.total_bold ? 900 : 700 }}>
                {invoice.total_amount.toLocaleString('fr-FR')} XAF
              </span>
            </div>
          </div>
        </div>

        <div className="invoice-footer" style={{ borderTop: `1px solid ${accent}`, paddingTop: 6, marginTop: 6 }}>
          {opts.show_footer_note && settings?.footer_note && (
            <p style={{ fontSize: `${fsSmall}pt`, whiteSpace: 'pre-line', margin: '2px 0' }}>{settings.footer_note}</p>
          )}
          {opts.show_querox_branding && (
            <p style={{ fontSize: `${fsSmall}pt`, textAlign: 'center', fontStyle: 'italic', margin: '4px 0 0 0' }}>
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
