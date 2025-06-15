
import React from 'react';
import { Ticket } from 'lucide-react';

const PromotionalBanner = () => {
  return (
    <div className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-2xl p-8 mb-8 flex flex-col md:flex-row items-center justify-between shadow-lg">
      <div className="mb-4 md:mb-0 text-center md:text-left">
        <h2 className="font-playfair text-3xl font-bold mb-2">Offre Spéciale!</h2>
        <p className="opacity-90">Profitez de -15% sur votre première commande.</p>
      </div>
      <div className="flex items-center gap-4 bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3 mt-4 md:mt-0">
        <Ticket className="w-8 h-8 opacity-80" />
        <div>
          <span className="block text-sm opacity-80">Utilisez le code</span>
          <span className="font-bold text-xl tracking-widest">BIENVENUE15</span>
        </div>
      </div>
    </div>
  );
};

export default PromotionalBanner;
