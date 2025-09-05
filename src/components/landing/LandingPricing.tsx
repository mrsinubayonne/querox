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
          <div className="mt-6 bg-primary/5 border border-primary/20 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-primary font-semibold">🚀 Commencez dès maintenant</p>
            <p className="text-muted-foreground text-sm mt-1">
              Paiement sécurisé • Configuration rapide • Support inclus
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
          <p className="text-muted-foreground">
            Commencez immédiatement avec votre plan choisi
          </p>
          <p className="text-sm text-muted-foreground/80 mt-2">
            Paiement sécurisé • Configuration en 5 minutes • Support client inclus
          </p>
        </div>
      </div>
    </section>
  );
};

export default LandingPricing;
