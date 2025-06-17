
import React from 'react';
import { plans } from '@/components/landing/pricingData';
import PricingCard from '@/components/landing/PricingCard';
import { Crown } from 'lucide-react';

const Abonnement: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-6">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choisissez votre abonnement QUEROX
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Pour accéder à toutes les fonctionnalités de QUEROX, vous devez souscrire à un abonnement. 
            Choisissez le plan qui correspond le mieux à vos besoins.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan, index) => (
            <PricingCard key={index} plan={plan} />
          ))}
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            Mode Test Activé
          </h3>
          <p className="text-yellow-700">
            Tous les paiements sont actuellement en mode test à 1000 FCFA pour faciliter les tests.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Abonnement;
