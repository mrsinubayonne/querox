import React, { useState } from 'react';
import ModernSidebar from '../components/ModernSidebar';
import SubscriptionGuard from '@/components/SubscriptionGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Megaphone, Palette, Mail, Users, Target, TrendingUp, Clock, CheckCircle, Facebook, Share2, MessageCircle, Star, Award, Camera, BarChart2 } from 'lucide-react';
import MarketingServiceCard from '@/components/marketing/MarketingServiceCard';
import ConceptionGraphiqueModal from '@/components/marketing/ConceptionGraphiqueModal';
import EmailMarketingModal from '@/components/marketing/EmailMarketingModal';
import ProgrammeFideliteModal from '@/components/marketing/ProgrammeFideliteModal';
import CampagnePublicitaireModal from '@/components/marketing/CampagnePublicitaireModal';
import GestionReseauxModal from '@/components/social/GestionReseauxModal';
import CreationContenuModal from '@/components/social/CreationContenuModal';
import AnalysePerformanceModal from '@/components/social/AnalysePerformanceModal';
import SubscriptionPopup from '@/components/SubscriptionPopup';
import { useIsMobile } from '@/hooks/use-mobile';
const Marketing: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const conceptionGraphiqueServices = [{
    id: 'conception-graphique',
    title: 'Conception Graphique',
    description: 'Création d\'affiches, flyers et supports visuels professionnels pour attirer vos clients',
    icon: Palette,
    color: 'from-violet-600 via-purple-600 to-fuchsia-600',
    deliveryTime: '3 jours',
    price: '7 000 FCFA'
  }];
  const socialMediaServices = [{
    id: 'gestion-reseaux',
    title: 'Gestion Réseaux Sociaux',
    description: 'Gestion complète de vos comptes Facebook, Instagram et TikTok',
    icon: Share2,
    color: 'from-blue-500 to-purple-500',
    deliveryTime: 'Mensuel',
    price: 'Sur devis'
  }, {
    id: 'creation-contenu',
    title: 'Création de Contenu',
    description: 'Photos, vidéos et visuels attractifs pour vos réseaux sociaux',
    icon: Camera,
    color: 'from-pink-500 to-rose-500',
    deliveryTime: '5 jours',
    price: 'Sur devis'
  }, {
    id: 'analyse-performance',
    title: 'Analyse de Performance',
    description: 'Rapports détaillés sur les performances de vos réseaux sociaux',
    icon: BarChart2,
    color: 'from-orange-500 to-yellow-500',
    deliveryTime: 'Mensuel',
    price: 'Sur devis'
  }];
  const facebookAdvertisingServices = [{
    id: 'campagne-publicitaire',
    title: 'Campagne Publicitaire Facebook',
    description: 'Stratégie publicitaire complète sur Facebook et Instagram pour maximiser votre visibilité',
    icon: Facebook,
    color: 'from-blue-600 via-indigo-600 to-purple-600',
    deliveryTime: '10 jours',
    price: 'Sur devis'
  }];
  const communicationServices = [{
    id: 'email-marketing',
    title: 'Email Marketing',
    description: 'Campagnes d\'emails personnalisées et automatisées pour fidéliser et convertir',
    icon: Mail,
    color: 'from-cyan-500 via-blue-500 to-indigo-600',
    deliveryTime: '5 jours',
    price: 'Sur devis'
  }, {
    id: 'programme-fidelite',
    title: 'Programme de Fidélité',
    description: 'Système complet de fidélisation avec récompenses et suivi client automatique',
    icon: Users,
    color: 'from-emerald-500 via-green-500 to-teal-600',
    deliveryTime: '7 jours',
    price: 'Sur devis'
  }];
  const openModal = (serviceId: string) => {
    setActiveModal(serviceId);
  };
  const closeModal = () => {
    setActiveModal(null);
  };
  return <SubscriptionGuard feature="les outils marketing">
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
                  <h3 className="text-4xl font-black text-gray-900 mb-3">Nos Solutions Marketing</h3>
                  <p className="text-xl text-gray-600">Services marketing et communication pour restaurants</p>
                </div>

                <Tabs defaultValue="conception" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 mb-8 h-14">
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
                    
                  </TabsList>

                  <TabsContent value="conception">
                    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8">
                      {conceptionGraphiqueServices.map(service => <MarketingServiceCard key={service.id} service={service} onSelect={() => openModal(service.id)} />)}
                    </div>
                  </TabsContent>

                  <TabsContent value="social">
                    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8">
                      {socialMediaServices.map(service => <MarketingServiceCard key={service.id} service={service} onSelect={() => openModal(service.id)} />)}
                    </div>
                  </TabsContent>

                  <TabsContent value="facebook">
                    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8">
                      {facebookAdvertisingServices.map(service => <MarketingServiceCard key={service.id} service={service} onSelect={() => openModal(service.id)} />)}
                    </div>
                  </TabsContent>

                  <TabsContent value="communication">
                    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8">
                      {communicationServices.map(service => <MarketingServiceCard key={service.id} service={service} onSelect={() => openModal(service.id)} />)}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Garanties et témoignages */}
              
            </div>
          </main>
        </div>

        {/* Modals */}
        {activeModal === 'conception-graphique' && <ConceptionGraphiqueModal onClose={closeModal} />}
        {activeModal === 'email-marketing' && <EmailMarketingModal onClose={closeModal} />}
        {activeModal === 'programme-fidelite' && <ProgrammeFideliteModal onClose={closeModal} />}
        {activeModal === 'campagne-publicitaire' && <CampagnePublicitaireModal onClose={closeModal} />}
        {activeModal === 'gestion-reseaux' && <GestionReseauxModal onClose={closeModal} />}
        {activeModal === 'creation-contenu' && <CreationContenuModal onClose={closeModal} />}
        {activeModal === 'analyse-performance' && <AnalysePerformanceModal onClose={closeModal} />}

        <SubscriptionPopup />
      </div>
    </SubscriptionGuard>;
};
export default Marketing;