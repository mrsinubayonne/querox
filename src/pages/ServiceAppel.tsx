
import React, { useState } from 'react';
import ModernSidebar from '../components/ModernSidebar';
import SubscriptionGuard from '@/components/SubscriptionGuard';
import { Phone, CheckCircle, Clock, Users, Star, Headphones } from 'lucide-react';
import ServiceAppelModal from '@/components/marketing/ServiceAppelModal';
import SubscriptionPopup from '@/components/SubscriptionPopup';
import { useIsMobile } from '@/hooks/use-mobile';
import MarketingServiceCard from '@/components/marketing/MarketingServiceCard';
import { Card, CardContent } from '@/components/ui/card';

const ServiceAppel: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const isMobile = useIsMobile();

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
    <SubscriptionGuard feature="le service d'appel professionnel">
      <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
        <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        
        <div className="flex-1 overflow-auto">
          {/* Header */}
          <header className="bg-white/95 backdrop-blur-xl border-b border-gray-200/60 px-8 py-6 sticky top-0 z-20 shadow-sm">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <div className="flex items-center space-x-6">
                <div className="p-3 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 rounded-xl shadow-lg">
                  <Phone className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-black bg-gradient-to-r from-gray-900 via-green-800 to-emerald-800 bg-clip-text text-transparent">
                    Service d'Appel
                  </h1>
                  <p className="text-lg text-gray-600 font-medium">
                    Gestion professionnelle de vos appels et réservations
                  </p>
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg px-6 py-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-lg font-semibold text-green-800">Service Expert</span>
                </div>
              </div>
            </div>
          </header>

          <main className="p-8 space-y-8">
            <div className="max-w-7xl mx-auto">
              {/* Hero Section */}
              <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-3xl p-8 lg:p-12 text-white shadow-2xl mb-8">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                      <Star className="h-5 w-5 text-yellow-300" />
                      <span className="text-lg font-semibold">Service Premium</span>
                    </div>
                    <h2 className="text-4xl font-black mb-4">Service d'appel professionnel</h2>
                    <p className="text-xl opacity-90 mb-6">
                      Ne perdez plus jamais un client. Notre équipe gère vos appels 24/7.
                    </p>
                  </div>
                  <div className="hidden lg:flex space-x-8">
                    <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                      <div className="text-3xl font-black text-yellow-300">24/7</div>
                      <div className="text-sm opacity-90">Disponible</div>
                    </div>
                    <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                      <div className="text-3xl font-black text-green-300">+50%</div>
                      <div className="text-sm opacity-90">Réservations</div>
                    </div>
                    <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                      <div className="text-3xl font-black text-blue-300">100%</div>
                      <div className="text-sm opacity-90">Professionnel</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Section */}
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

              {/* Features Section */}
              <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-sm mb-8">
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <h3 className="text-3xl font-black text-gray-900 mb-3">Ce que comprend notre service</h3>
                    <p className="text-lg text-gray-600">Des solutions complètes pour votre restaurant</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <Phone className="h-10 w-10 text-white" />
                      </div>
                      <h4 className="text-xl font-black mb-3">Prise de commandes</h4>
                      <p className="text-gray-600">Gestion professionnelle de vos commandes téléphoniques</p>
                    </div>
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <Clock className="h-10 w-10 text-white" />
                      </div>
                      <h4 className="text-xl font-black mb-3">Réservations</h4>
                      <p className="text-gray-600">Gestion de votre planning de réservations</p>
                    </div>
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <Users className="h-10 w-10 text-white" />
                      </div>
                      <h4 className="text-xl font-black mb-3">Information clients</h4>
                      <p className="text-gray-600">Renseignements sur vos services et menu</p>
                    </div>
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <Headphones className="h-10 w-10 text-white" />
                      </div>
                      <h4 className="text-xl font-black mb-3">Support dédié</h4>
                      <p className="text-gray-600">Équipe formée spécialement pour votre restaurant</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Service Card */}
              <div className="max-w-md mx-auto">
                {serviceCallServices.map((service) => (
                  <MarketingServiceCard
                    key={service.id}
                    service={service}
                    onSelect={() => setShowModal(true)}
                  />
                ))}
              </div>
            </div>
          </main>
        </div>

        {/* Modal */}
        {showModal && (
          <ServiceAppelModal onClose={() => setShowModal(false)} />
        )}

        <SubscriptionPopup />
      </div>
    </SubscriptionGuard>
  );
};

export default ServiceAppel;
