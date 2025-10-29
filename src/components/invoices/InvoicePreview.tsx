import React from 'react';
import { Card } from '@/components/ui/card';

interface InvoicePreviewProps {
  settings: {
    invoice_title?: string;
    company_name?: string;
    company_address?: string;
    company_phone?: string;
    company_email?: string;
    tax_id?: string;
    payment_terms?: string;
    footer_note?: string;
    logo_url?: string;
    primary_color?: string;
  };
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({ settings }) => {
  return (
    <Card className="relative p-8 bg-white shadow-lg max-w-2xl mx-auto border-4 border-black" style={{
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
          {settings.logo_url && (
            <img 
              src={settings.logo_url} 
              alt="Logo" 
              className="h-16 mx-auto mb-2 object-contain" 
            />
          )}
          {settings.company_name && (
            <>
              <h1 className="text-2xl font-bold text-black uppercase tracking-wider mb-1">
                {settings.company_name}
              </h1>
              <p className="text-xs text-black uppercase tracking-wide">
                {settings.payment_terms || 'CUISINE GASTRONOMIQUE'}
              </p>
            </>
          )}
        </div>

        {/* Date et Numéro de facture */}
        <div className="flex justify-between items-center mb-6 text-xs">
          <div className="text-black">
            {new Date().toLocaleDateString('fr-FR').replace(/\//g, '.')}
          </div>
          <div className="text-black font-bold uppercase">
            INVOICE #{new Date().getFullYear()}-001
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
          <div className="grid grid-cols-12 gap-2 items-start">
            <div className="col-span-2 text-sm text-black font-bold">
              2
            </div>
            <div className="col-span-7">
              <p className="text-sm font-bold text-black uppercase">PLAT PRINCIPAL</p>
              <p className="text-xs text-black">(SPÉCIALITÉ DE LA MAISON)</p>
            </div>
            <div className="col-span-3 text-sm text-black text-right">
              15,000
            </div>
          </div>

          <div className="grid grid-cols-12 gap-2 items-start">
            <div className="col-span-2 text-sm text-black font-bold">
              1
            </div>
            <div className="col-span-7">
              <p className="text-sm font-bold text-black uppercase">DESSERT</p>
              <p className="text-xs text-black">(PÂTISSERIE FINE)</p>
            </div>
            <div className="col-span-3 text-sm text-black text-right">
              5,000
            </div>
          </div>

          <div className="grid grid-cols-12 gap-2 items-start">
            <div className="col-span-2 text-sm text-black font-bold">
              3
            </div>
            <div className="col-span-7">
              <p className="text-sm font-bold text-black uppercase">BOISSONS</p>
              <p className="text-xs text-black">(COCKTAILS DE LA MAISON)</p>
            </div>
            <div className="col-span-3 text-sm text-black text-right">
              9,000
            </div>
          </div>
        </div>

        {/* Totaux */}
        <div className="border-t border-black pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-black uppercase">Subtotal</span>
            <span className="text-black">29,000</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-black uppercase">Service Charge (10%)</span>
            <span className="text-black">2,900</span>
          </div>
          <div className="flex justify-between text-base font-bold border-t border-black pt-2">
            <span className="text-black uppercase">Total Dû</span>
            <span className="text-black">31,900</span>
          </div>
        </div>

        {/* QR Code et message de remerciement */}
        <div className="mt-6 flex items-end justify-between">
          <div className="w-16 h-16 bg-black flex items-center justify-center text-white text-[8px] leading-tight p-1">
            QR CODE
          </div>
          <div className="text-right">
            <p className="text-[10px] text-black italic">
              {settings.footer_note || "MERCI D'AVOIR DÎNÉ AU BORD DE L'UNIVERS"}
            </p>
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
    </Card>
  );
};

export default InvoicePreview;
