
import React, { useState } from 'react';
import ModernSidebar from '../components/ModernSidebar';
import SubscriptionGuard from '@/components/SubscriptionGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Facebook, Star, Target, TrendingUp, CheckCircle, Users, Award, Eye } from 'lucide-react';
import MarketingServiceCard from '@/components/marketing/MarketingServiceCard';
import CampagnePublicitaireModal from '@/components/marketing/CampagnePublicitaireModal';
import SubscriptionPopup from '@/components/SubscriptionPopup';
import { useIsMobile } from '@/hooks/use-mobile';

const PubliciteFacebook: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const facebookAdvertisingServices = [{
    id: 'campagne-publicitaire',
    title: 'Campagne Publicitaire Facebook',
    description: 'Stratégie publicitaire complète sur Facebook et Instagram pour maximiser votre visibilité',
    icon: Facebook,
    color: 'from-blue-600 via-indigo-600 to-purple-600',
    deliveryTime: '10 jours',
    price: 'Sur devis'
  }];

  const openModal = (serviceId: string) => {
    setActiveModal(serviceId);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  return (
    <SubscriptionGuard feature="les outils marketing">
      <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
        <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        
        <div className="flex-1 overflow-auto">
          <header className="bg-white/95 backdrop-blur-xl border-b border-gray-200/60 px-8 py-6 sticky top-0 z-20 shadow-sm">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <div className="flex items-center space-x-6">
                <div className="p-3 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl shadow-lg">
                  <Facebook className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-black bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                    Publicité Facebook
                  </h1>
                  <p className="text-lg text-gray-600 font-medium">
                    Campagnes publicitaires ciblées et performantes
                  </p>
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg px-6 py-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-lg font-semibold text-green-800">Service Premium</span>
                </div>
              </div>
            </div>
          </header>

          <main className="p-8 space-y-8">
            <div className="max-w-7xl mx-auto">
              {/* Section héro */}
              <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 lg:p-12 text-white shadow-2xl mb-8">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                      <Star className="h-5 w-5 text-yellow-300" />
                      <span className="text-lg font-semibold">Experts Facebook Ads</span>
                    </div>
                    <h2 className="text-4xl font-black mb-4">Publicités qui Convertissent</h2>
                    <p className="text-xl opacity-90 mb-6">
                      Atteignez vos clients idéaux avec des campagnes ultra-ciblées
                    </p>
                  </div>
                  <div className="hidden lg:flex space-x-8">
                    <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                      <div className="text-3xl font-black text-yellow-300">5x</div>
                      <div className="text-sm opacity-90">ROI moyen</div>
                    </div>
                    <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                      <div className="text-3xl font-black text-green-300">10j</div>
                      <div className="text-sm opacity-90">Lancement</div>
                    </div>
                    <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                      <div className="text-3xl font-black text-blue-300">24/7</div>
                      <div className="text-sm opacity-90">Suivi</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Services */}
              <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8 mb-8">
                {facebookAdvertisingServices.map(service => (
                  <MarketingServiceCard 
                    key={service.id} 
                    service={service} 
                    onSelect={() => openModal(service.id)} 
                  />
                ))}
              </div>

              {/* Types de campagnes */}
              <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl font-black text-center">Types de Campagnes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <Eye className="h-8 w-8 text-white" />
                      </div>
                      <h4 className="font-black text-blue-800 text-lg mb-2">Notoriété</h4>
                      <p className="text-gray-600">Augmentez la visibilité de votre restaurant</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <Target className="h-8 w-8 text-white" />
                      </div>
                      <h4 className="font-black text-green-800 text-lg mb-2">Conversion</h4>
                      <p className="text-gray-600">Générez plus de réservations et commandes</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <Users className="h-8 w-8 text-white" />
                      </div>
                      <h4 className="font-black text-purple-800 text-lg mb-2">Fidélisation</h4>
                      <p className="text-gray-600">Fidélisez vos clients existants</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>

        {/* Modals */}
        {activeModal === 'campagne-publicitaire' && <CampagnePublicitaireModal onClose={closeModal} />}

        <SubscriptionPopup />
      </div>
    </SubscriptionGuard>
  );
};

export default PubliciteFacebook;
