import React, { useEffect, useState, useRef } from 'react';
import { Invoice } from '@/hooks/useInvoices';
import { supabase } from '@/integrations/supabase/client';
import { InvoiceSettings } from '@/hooks/useInvoiceSettings';

interface InvoicePrintViewProps {
  invoice: Invoice;
  servedBy?: string;
  format?: 'a4' | 'restaurant';
}

interface OutletData {
  name: string;
  address: string | null;
  phone: string | null;
}

const InvoicePrintView: React.FC<InvoicePrintViewProps> = ({ invoice, servedBy, format = 'restaurant' }) => {
  const [settings, setSettings] = useState<InvoiceSettings | null>(null);
  const [outlet, setOutlet] = useState<OutletData | null>(null);
  const printTriggered = useRef(false);

  useEffect(() => {
    const fetchInvoiceData = async () => {
      // Récupérer les infos du point de vente si disponible
      if (invoice.outlet_id) {
        const { data: outletData } = await supabase
          .from('outlets')
          .select('name, address, phone')
          .eq('id', invoice.outlet_id)
          .single();
        
        setOutlet(outletData);
      }

      // Récupérer les paramètres de facturation avec fallback en cascade
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
    };

    fetchInvoiceData();
  }, [invoice.outlet_id, invoice.user_id]);

  // Ouvrir une nouvelle fenêtre pour l'impression (compatible Safari/Mac)
  useEffect(() => {
    if (printTriggered.current) return;
    
    // Attendre que les données soient prêtes
    const timer = setTimeout(() => {
      printTriggered.current = true;
      openPrintWindow();
    }, 500);

    return () => clearTimeout(timer);
  }, [settings, outlet]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const openPrintWindow = () => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      // Fallback si popup bloquée
      window.print();
      return;
    }

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

    const itemsHtml = invoice.items && Array.isArray(invoice.items) && invoice.items.length > 0
      ? invoice.items.map((item: any) => `
          <tr>
            <td style="border: 1px solid #ccc; padding: 4px; font-size: 12px;">${item.name}</td>
            <td style="border: 1px solid #ccc; padding: 4px; text-align: center; font-size: 12px;">${item.quantity}</td>
            <td style="border: 1px solid #ccc; padding: 4px; text-align: right; font-size: 12px;">${item.price?.toLocaleString("fr-FR")} FCFA</td>
            <td style="border: 1px solid #ccc; padding: 4px; text-align: right; font-size: 12px; font-weight: 600;">${((item.price || 0) * (item.quantity || 0)).toLocaleString("fr-FR")} FCFA</td>
          </tr>
        `).join('')
      : `<tr><td colspan="4" style="border: 1px solid #ccc; padding: 4px; font-size: 12px;">Services et produits${invoice.notes ? ` - ${invoice.notes}` : ''}</td></tr>`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Facture ${invoice.invoice_number}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: Arial, sans-serif;
          }
          body {
            padding: ${format === 'a4' ? '15mm' : '8mm'};
            background: white;
            color: black;
          }
          @media print {
            @page {
              size: ${format === 'a4' ? 'A4' : 'A5'} portrait;
              margin: 5mm;
            }
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 10px;
            padding-bottom: 8px;
            border-bottom: 1px solid #ccc;
          }
          .logo {
            height: 48px;
            margin-bottom: 4px;
          }
          .company-name {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 0;
          }
          .company-info {
            font-size: 11px;
            color: black;
          }
          .invoice-title {
            font-size: 24px;
            font-weight: bold;
            text-align: right;
          }
          .invoice-number {
            font-size: 14px;
            font-weight: 600;
          }
          .invoice-date {
            font-size: 11px;
          }
          .customer-section {
            margin-bottom: 10px;
          }
          .customer-title {
            font-size: 12px;
            font-weight: bold;
          }
          .customer-info {
            font-size: 11px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
          }
          th {
            background: #f0f0f0;
            border: 1px solid #ccc;
            padding: 4px;
            font-size: 11px;
            font-weight: 600;
          }
          .total-section {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 10px;
          }
          .total-box {
            width: 180px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            padding: 6px 0;
            border-top: 2px solid #ccc;
            font-size: 14px;
            font-weight: bold;
          }
          .footer {
            border-top: 1px solid #ccc;
            padding-top: 8px;
            margin-top: 10px;
          }
          .footer-note {
            font-size: 11px;
            margin-bottom: 4px;
            white-space: pre-line;
          }
          .branding {
            font-size: 11px;
            text-align: center;
            font-style: italic;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            ${logoUrl ? `<img src="${logoUrl}" alt="Logo" class="logo">` : ''}
            <h1 class="company-name">${companyName}</h1>
            ${companyAddress ? `<p class="company-info">${companyAddress}</p>` : ''}
            ${companyPhone ? `<p class="company-info">Tél: ${companyPhone}</p>` : ''}
            ${companyEmail ? `<p class="company-info">${companyEmail}</p>` : ''}
            ${taxId ? `<p class="company-info">SIRET/TVA: ${taxId}</p>` : ''}
            ${nifNumber ? `<p class="company-info">NIU: ${nifNumber}</p>` : ''}
            ${rccmNumber ? `<p class="company-info">RCCM: ${rccmNumber}</p>` : ''}
            ${otherRegistration ? `<p class="company-info">${otherRegistration}</p>` : ''}
          </div>
          <div style="text-align: right;">
            <h2 class="invoice-title">${invoiceTitle}</h2>
            <p class="invoice-number">${invoice.invoice_number}</p>
            <p class="invoice-date">Date: ${formatDate(invoice.created_at)}</p>
          </div>
        </div>

        <div class="customer-section">
          <h3 class="customer-title">Facturé à:</h3>
          <p class="customer-info" style="font-weight: 600;">${invoice.customer_name || 'Client'}</p>
          ${invoice.customer_email ? `<p class="customer-info">${invoice.customer_email}</p>` : ''}
          ${invoice.customer_phone ? `<p class="customer-info">${invoice.customer_phone}</p>` : ''}
          ${servedBy ? `<p class="customer-info">Servi par: ${servedBy}</p>` : ''}
        </div>

        <table>
          <thead>
            <tr>
              <th style="text-align: left;">Article</th>
              <th style="text-align: center;">Qté</th>
              <th style="text-align: right;">P.U.</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="total-section">
          <div class="total-box">
            <div class="total-row">
              <span>TOTAL:</span>
              <span>${invoice.total_amount.toLocaleString("fr-FR")} FCFA</span>
            </div>
          </div>
        </div>

        <div class="footer">
          ${footerNote ? `<p class="footer-note">${footerNote}</p>` : ''}
          <p class="branding">Généré par QUEROX.me - Logiciel de gestion, automatisation et optimisation</p>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            }, 300);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Ce composant ne rend rien visuellement
  return null;
};

export default InvoicePrintView;
