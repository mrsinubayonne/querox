import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Invoice } from '@/hooks/useInvoices';
import { supabase } from '@/integrations/supabase/client';
import { InvoiceSettings } from '@/hooks/useInvoiceSettings';

interface InvoicePrintViewProps {
  invoice: Invoice;
  servedBy?: string;
}

interface OutletData {
  name: string;
  address: string | null;
  phone: string | null;
}

const InvoicePrintView: React.FC<InvoicePrintViewProps> = ({ invoice, servedBy }) => {
  const [settings, setSettings] = useState<InvoiceSettings | null>(null);
  const [outlet, setOutlet] = useState<OutletData | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    const fetchInvoiceData = async () => {
      console.log('🔍 Fetching invoice data for:', {
        outlet_id: invoice.outlet_id,
        user_id: invoice.user_id
      });

      // Récupérer les infos du point de vente si disponible
      if (invoice.outlet_id) {
        const { data: outletData, error: outletError } = await supabase
          .from('outlets')
          .select('name, address, phone')
          .eq('id', invoice.outlet_id)
          .single();
        
        console.log('📍 Outlet data:', outletData, 'Error:', outletError);
        setOutlet(outletData);
      }

      // Récupérer les paramètres de facturation avec fallback en cascade
      // 1. D'abord essayer avec outlet_id spécifique (si disponible)
      let settingsData = null;
      let settingsError = null;

      if (invoice.outlet_id) {
        const result = await supabase
          .from('invoice_settings')
          .select('*')
          .eq('user_id', invoice.user_id)
          .eq('outlet_id', invoice.outlet_id)
          .maybeSingle();
        
        settingsData = result.data;
        settingsError = result.error;
        console.log('🔍 Trying outlet-specific settings:', settingsData);
      }
      
      // 2. Si pas trouvé avec outlet_id, essayer les paramètres globaux
      if (!settingsData) {
        console.log('⚠️ No outlet-specific settings, trying global settings...');
        const globalResult = await supabase
          .from('invoice_settings')
          .select('*')
          .eq('user_id', invoice.user_id)
          .is('outlet_id', null)
          .maybeSingle();
        
        settingsData = globalResult.data;
        settingsError = globalResult.error;
        console.log('🔍 Global settings result:', settingsData);
      }
      
      // 3. Si toujours pas trouvé, prendre n'importe quels settings de l'utilisateur
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
        settingsError = anyResult.error;
        console.log('🔍 Any user settings result:', settingsData);
      }
      
      console.log('⚙️ Final settings data:', settingsData, 'Error:', settingsError);
      setSettings(settingsData);
      
      // Marquer les données comme chargées
      setDataLoaded(true);
    };

    fetchInvoiceData();
  }, [invoice.outlet_id, invoice.user_id]);

  // Déclencher l'impression automatiquement après le chargement des données
  useEffect(() => {
    if (dataLoaded) {
      console.log('✅ Data loaded, triggering print...');
      // Attendre un peu pour que le rendu soit complet
      const timer = setTimeout(() => {
        window.print();
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [dataLoaded]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  // Créer un portail qui s'attache directement au body pour l'impression
  return createPortal(
    <div id="invoice-print-portal" className="invoice-print-container" style={{ fontFamily: 'Arial, sans-serif', fontWeight: '600' }}>
      <style>{`
        /* Masquer tout le contenu normal et n'afficher que la facture */
        @media print {
          body > *:not(#invoice-print-portal) {
            display: none !important;
          }
          #invoice-print-portal {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            background: white !important;
            z-index: 99999 !important;
          }
          .invoice-print-container {
            padding: 8mm !important;
            width: 148mm !important;
            max-width: 100% !important;
            height: auto !important;
            overflow: hidden !important;
          }
          * {
            page-break-inside: avoid !important;
            page-break-after: avoid !important;
            page-break-before: avoid !important;
          }
          @page {
            size: A5 portrait;
            margin: 0;
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
            display: none;
          }
        }
      `}</style>

      {/* En-tête */}
      <div className="flex justify-between items-start mb-2 pb-1 border-b border-gray-300">
        <div>
          {settings?.logo_url && (
            <img 
              src={settings.logo_url} 
              alt="Logo" 
              className="h-12 mb-1" 
            />
          )}
          <h1 className="text-xl font-bold text-black mb-0">
            {settings?.company_name || outlet?.name || 'Mon Restaurant'}
          </h1>
          {settings?.company_address && (
            <p className="text-xs text-black whitespace-pre-line">{settings.company_address}</p>
          )}
          {!settings?.company_address && outlet?.address && (
            <p className="text-xs text-black whitespace-pre-line">{outlet.address}</p>
          )}
          {settings?.company_phone && (
            <p className="text-xs text-black">Tél: {settings.company_phone}</p>
          )}
          {!settings?.company_phone && outlet?.phone && (
            <p className="text-xs text-black">Tél: {outlet.phone}</p>
          )}
          {settings?.company_email && (
            <p className="text-xs text-black">{settings.company_email}</p>
          )}
          {settings?.tax_id && (
            <p className="text-xs text-black">SIRET/TVA: {settings.tax_id}</p>
          )}
        </div>
        <div className="text-right">
          <h2 
            className="text-2xl font-bold mb-0 text-black"
          >
            {settings?.invoice_title || "FACTURE"}
          </h2>
          <p 
            className="text-base text-black font-semibold"
          >
            {invoice.invoice_number}
          </p>
          <p className="text-xs text-black">Date: {formatDate(invoice.created_at)}</p>
        </div>
      </div>

      {/* Informations client */}
      <div className="mb-2">
        <h3 className="text-sm font-bold text-black mb-0">Facturé à:</h3>
        <p className="text-xs text-black font-semibold">
          {invoice.customer_name || "Client"}
        </p>
        {invoice.customer_email && (
          <p className="text-xs text-black">{invoice.customer_email}</p>
        )}
        {invoice.customer_phone && (
          <p className="text-xs text-black">{invoice.customer_phone}</p>
        )}
        {servedBy && (
          <p className="text-xs text-black">Servi par: {servedBy}</p>
        )}
      </div>

      {/* Détails de la facture */}
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
                  <td className="border border-gray-300 px-1 py-1 text-center text-xs">
                    {item.quantity}
                  </td>
                  <td className="border border-gray-300 px-1 py-1 text-right text-xs">
                    {item.price?.toLocaleString("fr-FR")} FCFA
                  </td>
                  <td className="border border-gray-300 px-1 py-1 text-right text-xs font-semibold">
                    {((item.price || 0) * (item.quantity || 0)).toLocaleString("fr-FR")} FCFA
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="border border-gray-300 px-1 py-1">
                  <p className="text-xs text-black">Services et produits</p>
                  {invoice.notes && (
                    <p className="text-xs text-black">{invoice.notes}</p>
                  )}
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
              {invoice.total_amount.toLocaleString("fr-FR")} FCFA
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-300 pt-2 mt-2">
        {settings?.footer_note && (
          <p className="text-xs text-black mb-1 whitespace-pre-line">
            {settings.footer_note}
          </p>
        )}
        <p className="text-xs text-black text-center">
          Généré par QUEROX - Logiciel de gestion, automatisation et optimisation
        </p>
      </div>
    </div>,
    document.body
  );
};

export default InvoicePrintView;
