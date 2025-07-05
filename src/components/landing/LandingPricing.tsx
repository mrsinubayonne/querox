
import React from 'react';
import { plans } from './pricingData';
import PricingCard from './PricingCard';
import ComparisonTable from './ComparisonTable';

const LandingPricing: React.FC = () => {
  return (
    <section id="pricing" className="py-20 bg-gradient-to-br from-gray-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-4xl font-black text-gray-900 mb-4">
            Des tarifs qui <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">boostent votre profit</span>
          </h2>
          <p className="mt-4 max-w-3xl mx-auto text-xl text-gray-600 leading-relaxed">
            Pas de frais cachés, pas de commissions sur vos ventes. 
            <br />
            <span className="font-bold text-purple-600">Juste des résultats garantis pour votre restaurant.</span>
          </p>
          
          {/* Badge de confiance */}
          <div className="mt-8 inline-flex items-center px-6 py-3 bg-green-50 border border-green-200 rounded-full text-green-700 text-sm font-bold">
            ✅ Essai gratuit 3 jours • ✅ Aucune carte bancaire • ✅ Support inclus
          </div>
        </div>
        
        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <PricingCard key={index} plan={plan} />
          ))}
        </div>

        <ComparisonTable />
        
        <div className="mt-16 text-center bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Pourquoi choisir QUEROX ?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">0%</div>
              <p className="text-gray-600">Commission sur vos ventes</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
              <p className="text-gray-600">Support client en français</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">5min</div>
              <p className="text-gray-600">Configuration complète</p>
            </div>
          </div>
          <p className="text-gray-600 mt-6">
            <strong>Garantie satisfait ou remboursé 30 jours</strong> • Paiement sécurisé • Annulation à tout moment
          </p>
        </div>
      </div>
    </section>
  );
};

export default LandingPricing;
