
import React from 'react';
import { Phone } from 'lucide-react';
import MarketingServiceCard from '@/components/marketing/MarketingServiceCard';

interface CallServiceSectionProps {
  onOpenModal: (serviceId: string) => void;
}

const CallServiceSection: React.FC<CallServiceSectionProps> = ({ onOpenModal }) => {
  const serviceCallServices = [
    {
      id: 'service-appel',
      title: 'Service d\'Appel',
      description: 'Service d\'appel professionnel pour la prise de commandes et réservations',
      icon: Phone,
      color: 'from-green-500 via-emerald-500 to-teal-600',
      deliveryTime: 'Immédiat',
      price: 'Sur devis'
    }
  ];

  return (
    <div className="mb-12">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mb-4">
          <Phone className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-3xl font-black text-gray-900 mb-3">Service d'Appel</h3>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Gestion professionnelle de vos appels entrants avec prise de commandes et réservations
        </p>
      </div>
      
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-black text-green-700 mb-2">24/7</div>
            <p className="text-sm text-gray-600">Disponibilité</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-green-700 mb-2">100%</div>
            <p className="text-sm text-gray-600">Professionnel</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-green-700 mb-2">+50%</div>
            <p className="text-sm text-gray-600">Réservations</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-green-700 mb-2">Multilingue</div>
            <p className="text-sm text-gray-600">Support</p>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto">
        {serviceCallServices.map((service) => (
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

export default CallServiceSection;
