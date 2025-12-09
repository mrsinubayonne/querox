import React, { forwardRef, useEffect, useState } from 'react';
import { Invoice } from '@/hooks/useInvoices';
import { supabase } from '@/integrations/supabase/client';
import { InvoiceSettings } from '@/hooks/useInvoiceSettings';

interface PrintableInvoiceProps {
  invoice: Invoice;
  servedBy?: string;
  format?: 'a4' | 'restaurant';
  onReady?: () => void;
}

interface OutletData {
  name: string;
  address: string | null;
  phone: string | null;
}

const PrintableInvoice = forwardRef<HTMLDivElement, PrintableInvoiceProps>(
  ({ invoice, servedBy, format = 'restaurant', onReady }, ref) => {
    const [settings, setSettings] = useState<InvoiceSettings | null>(null);
    const [outlet, setOutlet] = useState<OutletData | null>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
      const fetchInvoiceData = async () => {
        if (invoice.outlet_id) {
          const { data: outletData } = await supabase
            .from('outlets')
            .select('name, address, phone')
            .eq('id', invoice.outlet_id)
            .single();
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
        }
        
        if (!settingsData) {
          const globalResult = await supabase
            .from('invoice_settings')
            .select('*')
            .eq('user_id', invoice.user_id)
            .is('outlet_id', null)
            .maybeSingle();
          settingsData = globalResult.data;
        }
        
        if (!settingsData) {
          const anyResult = await supabase
            .from('invoice_settings')
            .select('*')
            .eq('user_id', invoice.user_id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          settingsData = anyResult.data;
        }

        setSettings(settingsData);
        setIsReady(true);
      };

      fetchInvoiceData();
    }, [invoice.outlet_id, invoice.user_id]);

    useEffect(() => {
      if (isReady && onReady) {
        onReady();
      }
    }, [isReady, onReady]);

    const formatDate = (dateString: string | null) => {
      if (!dateString) return '-';
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    };

    const companyName = settings?.company_name || outlet?.name || 'Mon Restaurant';
    const companyAddress = settings?.company_address || outlet?.address || '';
    const companyPhone = settings?.company_phone || outlet?.phone || '';
    const companyEmail = settings?.company_email || '';
    const logoUrl = settings?.logo_url || '';
    const invoiceTitle = settings?.invoice_title || 'FACTURE';
    const footerNote = settings?.footer_note || '';
    const taxId = settings?.tax_id || '';
    const nifNumber = (settings as any)?.nif_number || '';
    const rccmNumber = (settings as any)?.rccm_number || '';
    const otherRegistration = (settings as any)?.other_registration || '';

    const items = invoice.items && Array.isArray(invoice.items) ? invoice.items : [];

    if (!isReady) {
      return <div ref={ref} style={{ display: 'none' }}>Chargement...</div>;
    }

    return (
      <div 
        ref={ref} 
        className="printable-invoice-content"
        style={{
          fontFamily: 'Arial, sans-serif',
          padding: format === 'a4' ? '15mm' : '8mm',
          background: 'white',
          color: 'black',
          maxWidth: format === 'a4' ? '210mm' : '148mm',
          margin: '0 auto'
        }}
      >
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          marginBottom: '10px',
          paddingBottom: '8px',
          borderBottom: '1px solid #ccc'
        }}>
          <div>
            {logoUrl && (
              <img src={logoUrl} alt="Logo" style={{ height: '48px', marginBottom: '4px' }} />
            )}
            <h1 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>{companyName}</h1>
            {companyAddress && <p style={{ fontSize: '11px', margin: '2px 0' }}>{companyAddress}</p>}
            {companyPhone && <p style={{ fontSize: '11px', margin: '2px 0' }}>Tél: {companyPhone}</p>}
            {companyEmail && <p style={{ fontSize: '11px', margin: '2px 0' }}>{companyEmail}</p>}
            {taxId && <p style={{ fontSize: '11px', margin: '2px 0' }}>SIRET/TVA: {taxId}</p>}
            {nifNumber && <p style={{ fontSize: '11px', margin: '2px 0' }}>NIU: {nifNumber}</p>}
            {rccmNumber && <p style={{ fontSize: '11px', margin: '2px 0' }}>RCCM: {rccmNumber}</p>}
            {otherRegistration && <p style={{ fontSize: '11px', margin: '2px 0' }}>{otherRegistration}</p>}
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{invoiceTitle}</h2>
            <p style={{ fontSize: '14px', fontWeight: '600', margin: '4px 0' }}>{invoice.invoice_number}</p>
            <p style={{ fontSize: '11px', margin: '2px 0' }}>Date: {formatDate(invoice.created_at)}</p>
          </div>
        </div>

        {/* Customer */}
        <div style={{ marginBottom: '10px' }}>
          <h3 style={{ fontSize: '12px', fontWeight: 'bold', margin: '0 0 4px 0' }}>Facturé à:</h3>
          <p style={{ fontSize: '11px', fontWeight: '600', margin: '2px 0' }}>{invoice.customer_name || 'Client'}</p>
          {invoice.customer_email && <p style={{ fontSize: '11px', margin: '2px 0' }}>{invoice.customer_email}</p>}
          {invoice.customer_phone && <p style={{ fontSize: '11px', margin: '2px 0' }}>{invoice.customer_phone}</p>}
          {servedBy && <p style={{ fontSize: '11px', margin: '2px 0' }}>Servi par: {servedBy}</p>}
        </div>

        {/* Items Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px' }}>
          <thead>
            <tr>
              <th style={{ background: '#f0f0f0', border: '1px solid #ccc', padding: '4px', fontSize: '11px', fontWeight: '600', textAlign: 'left' }}>Article</th>
              <th style={{ background: '#f0f0f0', border: '1px solid #ccc', padding: '4px', fontSize: '11px', fontWeight: '600', textAlign: 'center' }}>Qté</th>
              <th style={{ background: '#f0f0f0', border: '1px solid #ccc', padding: '4px', fontSize: '11px', fontWeight: '600', textAlign: 'right' }}>P.U.</th>
              <th style={{ background: '#f0f0f0', border: '1px solid #ccc', padding: '4px', fontSize: '11px', fontWeight: '600', textAlign: 'right' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {items.length > 0 ? items.map((item: any, index: number) => (
              <tr key={index}>
                <td style={{ border: '1px solid #ccc', padding: '4px', fontSize: '12px' }}>{item.name}</td>
                <td style={{ border: '1px solid #ccc', padding: '4px', fontSize: '12px', textAlign: 'center' }}>{item.quantity}</td>
                <td style={{ border: '1px solid #ccc', padding: '4px', fontSize: '12px', textAlign: 'right' }}>{item.price?.toLocaleString('fr-FR')} FCFA</td>
                <td style={{ border: '1px solid #ccc', padding: '4px', fontSize: '12px', textAlign: 'right', fontWeight: '600' }}>{((item.price || 0) * (item.quantity || 0)).toLocaleString('fr-FR')} FCFA</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} style={{ border: '1px solid #ccc', padding: '4px', fontSize: '12px' }}>
                  Services et produits{invoice.notes ? ` - ${invoice.notes}` : ''}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Total */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
          <div style={{ width: '180px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              padding: '6px 0', 
              borderTop: '2px solid #ccc',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              <span>TOTAL:</span>
              <span>{invoice.total_amount.toLocaleString('fr-FR')} FCFA</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ borderTop: '1px solid #ccc', paddingTop: '8px', marginTop: '10px' }}>
          {footerNote && (
            <p style={{ fontSize: '11px', marginBottom: '4px', whiteSpace: 'pre-line' }}>{footerNote}</p>
          )}
          <p style={{ fontSize: '11px', textAlign: 'center', fontStyle: 'italic' }}>
            Généré par QUEROX.me - Logiciel de gestion, automatisation et optimisation
          </p>
        </div>
      </div>
    );
  }
);

PrintableInvoice.displayName = 'PrintableInvoice';

export default PrintableInvoice;
