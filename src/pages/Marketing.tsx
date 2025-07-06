
import React, { useState } from 'react';
import ModernSidebar from '../components/ModernSidebar';
import SubscriptionGuard from '@/components/SubscriptionGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Megaphone, 
  Palette, 
  Mail, 
  Users, 
  Target,
  TrendingUp,
  Gift,
  Camera
} from 'lucide-react';
import MarketingServiceCard from '@/components/marketing/MarketingServiceCard';
import ConceptionGraphiqueModal from '@/components/marketing/ConceptionGraphiqueModal';
import EmailMarketingModal from '@/components/marketing/EmailMarketingModal';
import ProgrammeFideliteModal from '@/components/marketing/ProgrammeFideliteModal';
import CampagnePublicitaireModal from '@/components/marketing/CampagnePublicitaireModal';

const Marketing: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const marketingServices = [
    {
      id: 'conception-graphique',
      title: 'Conception Graphique',
      description: 'Création d\'affiches, flyers et supports visuels pour votre restaurant',
      icon: Palette,
      color: 'from-purple-500 to-pink-500',
      deliveryTime: '3 jours',
      price: 'Sur devis'
    },
    {
      id: 'email-marketing',
      title: 'Email Marketing',
      description: 'Campagnes d\'emails personnalisées pour fidéliser vos clients',
      icon: Mail,
      color: 'from-blue-500 to-cyan-500',
      deliveryTime: '5 jours',
      price: 'Sur devis'
    },
    {
      id: 'programme-fidelite',
      title: 'Programme de Fidélité',
      description: 'Mise en place d\'un système de fidélisation client efficace',
      icon: Users,
      color: 'from-green-500 to-emerald-500',
      deliveryTime: '7 jours',
      price: 'Sur devis'
    },
    {
      id: 'campagne-publicitaire',
      title: 'Campagne Publicitaire',
      description: 'Stratégie et création de campagnes publicitaires ciblées',
      icon: Target,
      color: 'from-orange-500 to-red-500',
      deliveryTime: '10 jours',
      price: 'Sur devis'
    }
  ];

  const openModal = (serviceId: string) => {
    setActiveModal(serviceId);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  return (
    <SubscriptionGuard feature="les outils marketing">
      <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/50">
        <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        
        <div className="flex-1 overflow-auto">
          <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100/50 px-8 py-6 sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-pink-800 bg-clip-text text-transparent">
                  Services Marketing
                </h1>
                <p className="text-sm text-gray-500 mt-1 font-medium">
                  Boostez votre restaurant avec nos services marketing personnalisés
                </p>
              </div>
            </div>
          </header>

          <main className="p-8">
            <div className="max-w-6xl mx-auto">
              {/* Introduction */}
              <Card className="mb-8 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full">
                      <Megaphone className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        Développez votre activité
                      </h2>
                      <p className="text-gray-600">
                        Nos experts vous accompagnent dans vos stratégies marketing
                      </p>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700">
                      <strong>Comment ça marche :</strong> Choisissez un service, remplissez le formulaire avec vos besoins, 
                      et recevez votre livrable dans les délais annoncés. Paiement sécurisé et satisfaction garantie.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Services Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {marketingServices.map((service) => (
                  <MarketingServiceCard
                    key={service.id}
                    service={service}
                    onSelect={() => openModal(service.id)}
                  />
                ))}
              </div>

              {/* Garanties */}
              <Card className="mt-8 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4 text-center">Nos Garanties</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <h4 className="font-semibold text-green-800">Qualité Premium</h4>
                      <p className="text-sm text-green-600">Designs professionnels et impactants</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <Gift className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <h4 className="font-semibold text-blue-800">Livraison Rapide</h4>
                      <p className="text-sm text-blue-600">Respect des délais annoncés</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <h4 className="font-semibold text-purple-800">Support Dédié</h4>
                      <p className="text-sm text-purple-600">Accompagnement personnalisé</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>

        {/* Modals */}
        {activeModal === 'conception-graphique' && (
          <ConceptionGraphiqueModal onClose={closeModal} />
        )}
        {activeModal === 'email-marketing' && (
          <EmailMarketingModal onClose={closeModal} />
        )}
        {activeModal === 'programme-fidelite' && (
          <ProgrammeFideliteModal onClose={closeModal} />
        )}
        {activeModal === 'campagne-publicitaire' && (
          <CampagnePublicitaireModal onClose={closeModal} />
        )}
      </div>
    </SubscriptionGuard>
  );
};

export default Marketing;
