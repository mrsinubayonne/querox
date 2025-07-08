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
  Clock,
  CheckCircle,
  Facebook,
  Share2,
  MessageCircle,
  Star,
  Award,
  Phone,
  Headphones,
  UserCheck,
  Camera,
  BarChart2
} from 'lucide-react';
import MarketingServiceCard from '@/components/marketing/MarketingServiceCard';
import ConceptionGraphiqueModal from '@/components/marketing/ConceptionGraphiqueModal';
import EmailMarketingModal from '@/components/marketing/EmailMarketingModal';
import ProgrammeFideliteModal from '@/components/marketing/ProgrammeFideliteModal';
import CampagnePublicitaireModal from '@/components/marketing/CampagnePublicitaireModal';
import ConsultingModal from '@/components/marketing/ConsultingModal';
import ServiceAppelModal from '@/components/marketing/ServiceAppelModal';
import GestionReseauxModal from '@/components/social/GestionReseauxModal';
import CreationContenuModal from '@/components/social/CreationContenuModal';
import AnalysePerformanceModal from '@/components/social/AnalysePerformanceModal';
import SubscriptionPopup from '@/components/SubscriptionPopup';
import { useIsMobile } from '@/hooks/use-mobile';

const Marketing: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const conceptionGraphiqueServices = [
    {
      id: 'conception-graphique',
      title: 'Conception Graphique',
      description: 'Création d\'affiches, flyers et supports visuels professionnels pour attirer vos clients',
      icon: Palette,
      color: 'from-violet-600 via-purple-600 to-fuchsia-600',
      deliveryTime: '3 jours',
      price: '7 000 FCFA'
    }
  ];

  const socialMediaServices = [
    {
      id: 'gestion-reseaux',
      title: 'Gestion Réseaux Sociaux',
      description: 'Gestion complète de vos comptes Facebook, Instagram et TikTok',
      icon: Share2,
      color: 'from-blue-500 to-purple-500',
      deliveryTime: 'Mensuel',
      price: 'Sur devis'
    },
    {
      id: 'creation-contenu',
      title: 'Création de Contenu',
      description: 'Photos, vidéos et visuels attractifs pour vos réseaux sociaux',
      icon: Camera,
      color: 'from-pink-500 to-rose-500',
      deliveryTime: '5 jours',
      price: 'Sur devis'
    },
    {
      id: 'analyse-performance',
      title: 'Analyse de Performance',
      description: 'Rapports détaillés sur les performances de vos réseaux sociaux',
      icon: BarChart2,
      color: 'from-orange-500 to-yellow-500',
      deliveryTime: 'Mensuel',
      price: 'Sur devis'
    }
  ];

  const facebookAdvertisingServices = [
    {
      id: 'campagne-publicitaire',
      title: 'Campagne Publicitaire Facebook',
      description: 'Stratégie publicitaire complète sur Facebook et Instagram pour maximiser votre visibilité',
      icon: Facebook,
      color: 'from-blue-600 via-indigo-600 to-purple-600',
      deliveryTime: '10 jours',
      price: 'Sur devis'
    }
  ];

  const communicationServices = [
    {
      id: 'email-marketing',
      title: 'Email Marketing',
      description: 'Campagnes d\'emails personnalisées et automatisées pour fidéliser et convertir',
      icon: Mail,
      color: 'from-cyan-500 via-blue-500 to-indigo-600',
      deliveryTime: '5 jours',
      price: 'Sur devis'
    },
    {
      id: 'programme-fidelite',
      title: 'Programme de Fidélité',
      description: 'Système complet de fidélisation avec récompenses et suivi client automatique',
      icon: Users,
      color: 'from-emerald-500 via-green-500 to-teal-600',
      deliveryTime: '7 jours',
      price: 'Sur devis'
    }
  ];

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
    <SubscriptionGuard feature="les outils marketing">
      <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
        <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        
        <div className="flex-1 overflow-auto">
          {/* Header */}
          <header className="bg-white/95 backdrop-blur-xl border-b border-gray-200/60 px-8 py-6 sticky top-0 z-20 shadow-sm">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <div className="flex items-center space-x-6">
                <div className="p-3 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-xl shadow-lg">
                  <Megaphone className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-black bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                    Marketing & Communication
                  </h1>
                  <p className="text-lg text-gray-600 font-medium">
                    Solutions complètes pour développer votre activité
                  </p>
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg px-6 py-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-lg font-semibold text-green-800">Services Premium</span>
                </div>
              </div>
            </div>
          </header>

          <main className="p-8 space-y-8">
            <div className="max-w-7xl mx-auto">
              {/* Section héro */}
              <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl p-8 lg:p-12 text-white shadow-2xl mb-8">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                      <Star className="h-5 w-5 text-yellow-300" />
                      <span className="text-lg font-semibold">Solution #1 en France</span>
                    </div>
                    <h2 className="text-4xl font-black mb-4">Révolutionnez votre marketing</h2>
                    <p className="text-xl opacity-90 mb-6">
                      Rejoignez plus de 2000 restaurants qui ont choisi l'excellence
                    </p>
                  </div>
                  <div className="hidden lg:flex space-x-8">
                    <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                      <div className="text-3xl font-black text-yellow-300">98%</div>
                      <div className="text-sm opacity-90">Satisfaction</div>
                    </div>
                    <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                      <div className="text-3xl font-black text-green-300">+45%</div>
                      <div className="text-sm opacity-90">CA moyen</div>
                    </div>
                    <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                      <div className="text-3xl font-black text-blue-300">24h</div>
                      <div className="text-sm opacity-90">Support</div>
                    </div>
                    <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                      <div className="text-3xl font-black text-purple-300">5★</div>
                      <div className="text-sm opacity-90">Note</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Processus */}
              <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-sm mb-8">
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <h3 className="text-3xl font-black text-gray-900 mb-3">Comment ça marche ?</h3>
                    <p className="text-lg text-gray-600">Un processus simplifié en 3 étapes</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <span className="text-3xl font-black text-white">1</span>
                      </div>
                      <h4 className="text-xl font-black mb-3">Sélectionnez</h4>
                      <p className="text-gray-600">Choisissez le service adapté à vos besoins</p>
                    </div>
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-teal-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <span className="text-3xl font-black text-white">2</span>
                      </div>
                      <h4 className="text-xl font-black mb-3">Personnalisez</h4>
                      <p className="text-gray-600">Définissez vos besoins et votre vision</p>
                    </div>
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <span className="text-3xl font-black text-white">3</span>
                      </div>
                      <h4 className="text-xl font-black mb-3">Réussissez</h4>
                      <p className="text-gray-600">Recevez votre solution dans les délais</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Services avec tabs */}
              <div>
                <div className="text-center mb-8">
                  <h3 className="text-4xl font-black text-gray-900 mb-3">Nos Solutions Expertes</h3>
                  <p className="text-xl text-gray-600">Services marketing conçus spécialement pour les restaurants</p>
                </div>

                <Tabs defaultValue="conception" className="w-full">
                  <TabsList className="grid w-full grid-cols-6 mb-8 h-14">
                    <TabsTrigger value="conception" className="flex items-center gap-2 text-sm">
                      <Palette className="h-4 w-4" />
                      Design
                    </TabsTrigger>
                    <TabsTrigger value="social" className="flex items-center gap-2 text-sm">
                      <Share2 className="h-4 w-4" />
                      Réseaux Sociaux
                    </TabsTrigger>
                    <TabsTrigger value="facebook" className="flex items-center gap-2 text-sm">
                      <Facebook className="h-4 w-4" />
                      Pub Facebook
                    </TabsTrigger>
                    <TabsTrigger value="communication" className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4" />
                      Communication
                    </TabsTrigger>
                    <TabsTrigger value="appel" className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4" />
                      Service Appel
                    </TabsTrigger>
                    <TabsTrigger value="consulting" className="flex items-center gap-2 text-sm">
                      <UserCheck className="h-4 w-4" />
                      Consulting
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="conception">
                    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8">
                      {conceptionGraphiqueServices.map((service) => (
                        <MarketingServiceCard
                          key={service.id}
                          service={service}
                          onSelect={() => openModal(service.id)}
                        />
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="social">
                    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8">
                      {socialMediaServices.map((service) => (
                        <MarketingServiceCard
                          key={service.id}
                          service={service}
                          onSelect={() => openModal(service.id)}
                        />
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="facebook">
                    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8">
                      {facebookAdvertisingServices.map((service) => (
                        <MarketingServiceCard
                          key={service.id}
                          service={service}
                          onSelect={() => openModal(service.id)}
                        />
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="communication">
                    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8">
                      {communicationServices.map((service) => (
                        <MarketingServiceCard
                          key={service.id}
                          service={service}
                          onSelect={() => openModal(service.id)}
                        />
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="appel">
                    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8">
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
                    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8">
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

              {/* Garanties et témoignages */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
                <Card className="border-0 shadow-lg bg-white/95">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-2xl font-black text-center">Nos Garanties</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <h4 className="font-black text-green-800 text-lg">Excellence Garantie</h4>
                        <p className="text-gray-600">Créations premium par nos experts</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Clock className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <h4 className="font-black text-blue-800 text-lg">Livraison Express</h4>
                        <p className="text-gray-600">Respect des délais avec suivi temps réel</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Users className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <h4 className="font-black text-purple-800 text-lg">Support VIP</h4>
                        <p className="text-gray-600">Accompagnement personnalisé</p>
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
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-black">
                          JD
                        </div>
                        <div className="ml-4">
                          <h4 className="font-black">Jean Dupont</h4>
                          <p className="text-gray-600 text-sm">Restaurant Le Bistrot</p>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 italic">"Nos ventes ont explosé de 55% grâce à leur stratégie marketing !"</p>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-black">
                          MR
                        </div>
                        <div className="ml-4">
                          <h4 className="font-black">Marie Rodriguez</h4>
                          <p className="text-gray-600 text-sm">Pizzeria Bella Vista</p>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 italic">"Designs magnifiques et livraison ultra rapide ! Je recommande !"</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
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
        {activeModal === 'consulting' && (
          <ConsultingModal onClose={closeModal} />
        )}
        {activeModal === 'service-appel' && (
          <ServiceAppelModal onClose={closeModal} />
        )}
        {activeModal === 'gestion-reseaux' && (
          <GestionReseauxModal onClose={closeModal} />
        )}
        {activeModal === 'creation-contenu' && (
          <CreationContenuModal onClose={closeModal} />
        )}
        {activeModal === 'analyse-performance' && (
          <AnalysePerformanceModal onClose={closeModal} />
        )}

        <SubscriptionPopup />
      </div>
    </SubscriptionGuard>
  );
};

export default Marketing;