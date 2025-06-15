
import React from 'react';
import { Ticket } from 'lucide-react';

const PromotionalBanner = () => {
  return (
    <div className="bg-emerald-50 text-emerald-900 rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between border border-emerald-200 shadow-sm">
      <div className="mb-4 md:mb-0 text-center md:text-left">
        <h2 className="font-playfair text-2xl font-bold mb-1">Offre Spéciale!</h2>
        <p className="opacity-90">Profitez de -15% sur votre première commande.</p>
      </div>
      <div className="flex items-center gap-4 bg-white/60 rounded-lg px-4 py-2 mt-4 md:mt-0 border border-emerald-100">
        <Ticket className="w-6 h-6 text-emerald-600" />
        <div>
          <span className="block text-xs opacity-80">Utilisez le code</span>
          <span className="font-bold text-lg tracking-widest text-emerald-800">BIENVENUE15</span>
        </div>
      </div>
    </div>
  );
};

export default PromotionalBanner;
