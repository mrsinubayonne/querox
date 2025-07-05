
import React from 'react';
import { plans } from './pricingData';
import PricingCard from './PricingCard';
import ComparisonTable from './ComparisonTable';

const LandingPricing: React.FC = () => {
  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Choisissez votre plan
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600">
            Des tarifs transparents qui s'adaptent à la taille de votre restaurant
          </p>
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-green-800 font-semibold">🎉 Offre spéciale de lancement</p>
            <p className="text-green-700 text-sm mt-1">
              3 jours d'essai gratuit sur tous nos plans • Aucun engagement
            </p>
          </div>
        </div>
        
        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <PricingCard key={index} plan={plan} />
          ))}
        </div>

        <ComparisonTable />
        
        <div className="mt-12 text-center">
          <p className="text-gray-600">
            Tous nos plans incluent 3 jours d'essai gratuit
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Paiement sécurisé • Annulation à tout moment • Support client inclus
          </p>
        </div>
      </div>
    </section>
  );
};

export default LandingPricing;
