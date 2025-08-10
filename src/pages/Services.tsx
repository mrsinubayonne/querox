
import React, { useState } from 'react';
import ModernSidebar from '../components/ModernSidebar';
import SubscriptionGuard from '@/components/SubscriptionGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Phone, 
  UserCheck,
  Headphones,
  Clock,
  CheckCircle,
  Star,
  TrendingUp,
  Users,
  Award
} from 'lucide-react';
import MarketingServiceCard from '@/components/marketing/MarketingServiceCard';
import ConsultingModal from '@/components/marketing/ConsultingModal';
import ServiceAppelModal from '@/components/marketing/ServiceAppelModal';
import SubscriptionPopup from '@/components/SubscriptionPopup';
import { useIsMobile } from '@/hooks/use-mobile';

const Services: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
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

  const openModal = (serviceId: string) => {
    setActiveModal(serviceId);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  return (
    <SubscriptionGuard feature="les services professionnels">
      <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
        <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        
        <div className="flex-1 overflow-auto">
          {/* Header */}
          <header className="bg-white/95 backdrop-blur-xl border-b border-gray-200/60 px-8 py-6 sticky top-0 z-20 shadow-sm">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <div className="flex items-center space-x-6">
                <div className="p-3 bg-gradient-to-br from-green-600 via-purple-600 to-indigo-600 rounded-xl shadow-lg">
                  <Headphones className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-black bg-gradient-to-r from-gray-900 via-green-800 to-purple-800 bg-clip-text text-transparent">
                    Services Professionnels
                  </h1>
                  <p className="text-lg text-gray-600 font-medium">
                    Services d'appel et consulting pour restaurants
                  </p>
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg px-6 py-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-lg font-semibold text-green-800">Services Expert</span>
                </div>
              </div>
            </div>
          </header>

          <main className="p-8 space-y-8">
            <div className="max-w-7xl mx-auto">
              {/* Section héro */}
              <div className="bg-gradient-to-r from-green-600 via-purple-600 to-indigo-600 rounded-3xl p-8 lg:p-12 text-white shadow-2xl mb-8">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                      <Star className="h-5 w-5 text-yellow-300" />
                      <span className="text-lg font-semibold">Services Premium</span>
                    </div>
                    <h2 className="text-4xl font-black mb-4">Solutions professionnelles sur mesure</h2>
                    <p className="text-xl opacity-90 mb-6">
                      Optimisez votre restaurant avec nos services experts
                    </p>
                  </div>
                  <div className="hidden lg:flex space-x-8">
                    <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                      <div className="text-3xl font-black text-yellow-300">24/7</div>
                      <div className="text-sm opacity-90">Disponible</div>
                    </div>
                    <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                      <div className="text-3xl font-black text-green-300">+30%</div>
                      <div className="text-sm opacity-90">Efficacité</div>
                    </div>
                    <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                      <div className="text-3xl font-black text-blue-300">Expert</div>
                      <div className="text-sm opacity-90">Conseil</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Processus */}
              <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-sm mb-8">
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <h3 className="text-3xl font-black text-gray-900 mb-3">Pourquoi nos services ?</h3>
                    <p className="text-lg text-gray-600">Des solutions adaptées aux besoins des restaurants</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <Phone className="h-10 w-10 text-white" />
                      </div>
                      <h4 className="text-xl font-black mb-3">Service d'appel</h4>
                      <p className="text-gray-600">Gestion professionnelle de vos appels et réservations</p>
                    </div>
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <UserCheck className="h-10 w-10 text-white" />
                      </div>
                      <h4 className="text-xl font-black mb-3">Consulting</h4>
                      <p className="text-gray-600">Conseils stratégiques pour optimiser votre restaurant</p>
                    </div>
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <TrendingUp className="h-10 w-10 text-white" />
                      </div>
                      <h4 className="text-xl font-black mb-3">Résultats</h4>
                      <p className="text-gray-600">Amélioration mesurable de vos performances</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Services avec tabs */}
              <div>
                <div className="text-center mb-8">
                  <h3 className="text-4xl font-black text-gray-900 mb-3">Nos Services Experts</h3>
                  <p className="text-xl text-gray-600">Solutions professionnelles pour restaurants</p>
                </div>

                <Tabs defaultValue="appel" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-8 h-14 max-w-md mx-auto">
                    <TabsTrigger value="appel" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Service d'Appel
                    </TabsTrigger>
                    <TabsTrigger value="consulting" className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4" />
                      Consulting
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="appel">
                    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8 max-w-4xl mx-auto">
                      {serviceCallServices.map((service) => (
                        <MarketingServiceCard
                          key={service.id}
                          service={service}
                          onSelect={() => openModal(service.id)}
                        />
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="consulting">
                    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8 max-w-4xl mx-auto">
                      {consultingServices.map((service) => (
                        <MarketingServiceCard
                          key={service.id}
                          service={service}
                          onSelect={() => openModal(service.id)}
                        />
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Avantages */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
                <Card className="border-0 shadow-lg bg-white/95">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-2xl font-black text-center">Nos Garanties</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Award className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <h4 className="font-black text-green-800 text-lg">Excellence Garantie</h4>
                        <p className="text-gray-600">Services de qualité supérieure</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Clock className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <h4 className="font-black text-blue-800 text-lg">Disponibilité 24/7</h4>
                        <p className="text-gray-600">Support continu selon vos besoins</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Users className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <h4 className="font-black text-purple-800 text-lg">Équipe Dédiée</h4>
                        <p className="text-gray-600">Professionnels expérimentés</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-white/95">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-2xl font-black text-center">Témoignages</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-black">
                          AL
                        </div>
                        <div className="ml-4">
                          <h4 className="font-black">Antoine Laurent</h4>
                          <p className="text-gray-600 text-sm">Restaurant Le Gourmet</p>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 italic">"Le service d'appel a révolutionné notre gestion des réservations !"</p>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-black">
                          SC
                        </div>
                        <div className="ml-4">
                          <h4 className="font-black">Sophie Chen</h4>
                          <p className="text-gray-600 text-sm">Bistrot moderne</p>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 italic">"Le consulting nous a aidés à optimiser nos coûts de 25% !"</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </div>

        {/* Modals */}
        {activeModal === 'service-appel' && (
          <ServiceAppelModal onClose={closeModal} />
        )}
        {activeModal === 'consulting' && (
          <ConsultingModal onClose={closeModal} />
        )}

        <SubscriptionPopup />
      </div>
    </SubscriptionGuard>
  );
};

export default Services;
