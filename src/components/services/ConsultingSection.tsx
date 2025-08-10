
import React from 'react';
import { UserCheck } from 'lucide-react';
import MarketingServiceCard from '@/components/marketing/MarketingServiceCard';

interface ConsultingSectionProps {
  onOpenModal: (serviceId: string) => void;
}

const ConsultingSection: React.FC<ConsultingSectionProps> = ({ onOpenModal }) => {
  const consultingServices = [
    {
      id: 'consulting',
      title: 'Consulting Restaurant',
      description: 'Conseils stratégiques personnalisés pour optimiser votre établissement',
      icon: UserCheck,
      color: 'from-purple-500 via-indigo-500 to-blue-600',
      deliveryTime: '2h par session',
      price: 'Sur devis'
    }
  ];

  return (
    <div className="mb-12">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl mb-4">
          <UserCheck className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-3xl font-black text-gray-900 mb-3">Consulting Restaurant</h3>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Expertise et conseils stratégiques pour optimiser votre restaurant et augmenter votre rentabilité
        </p>
      </div>
      
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-8 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-black text-purple-700 mb-2">15+</div>
            <p className="text-sm text-gray-600">Années d'expérience</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-purple-700 mb-2">200+</div>
            <p className="text-sm text-gray-600">Restaurants accompagnés</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-purple-700 mb-2">25%</div>
            <p className="text-sm text-gray-600">Économies moyennes</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-purple-700 mb-2">ROI</div>
            <p className="text-sm text-gray-600">Garanti sous 3 mois</p>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto">
        {consultingServices.map((service) => (
          <MarketingServiceCard
            key={service.id}
            service={service}
            onSelect={() => onOpenModal(service.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default ConsultingSection;
