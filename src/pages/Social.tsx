
import React, { useState } from 'react';
import ModernSidebar from '../components/ModernSidebar';
import SubscriptionGuard from '@/components/SubscriptionGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Share2, 
  Heart, 
  MessageCircle, 
  Camera,
  Calendar,
  TrendingUp,
  Users,
  Target
} from 'lucide-react';
import MarketingServiceCard from '@/components/marketing/MarketingServiceCard';
import GestionReseauxModal from '@/components/social/GestionReseauxModal';
import CreationContenuModal from '@/components/social/CreationContenuModal';
import CommunityManagementModal from '@/components/social/CommunityManagementModal';
import AnalysePerformanceModal from '@/components/social/AnalysePerformanceModal';

const Social: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const socialServices = [
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
      id: 'community-management',
      title: 'Community Management',
      description: 'Animation de votre communauté et interaction avec vos clients',
      icon: MessageCircle,
      color: 'from-green-500 to-teal-500',
      deliveryTime: 'Quotidien',
      price: 'Sur devis'  
    },
    {
      id: 'analyse-performance',
      title: 'Analyse de Performance',
      description: 'Rapports détaillés sur les performances de vos réseaux sociaux',
      icon: TrendingUp,
      color: 'from-orange-500 to-yellow-500',
      deliveryTime: 'Mensuel',
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
    <SubscriptionGuard feature="les services réseaux sociaux">
      <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/50">
        <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        
        <div className="flex-1 overflow-auto">
          <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100/50 px-8 py-6 sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-pink-800 bg-clip-text text-transparent">
                  Services Réseaux Sociaux
                </h1>
                <p className="text-sm text-gray-500 mt-1 font-medium">
                  Développez votre présence en ligne et fidélisez votre clientèle
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
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full">
                      <Share2 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        Rayonnez sur les réseaux sociaux
                      </h2>
                      <p className="text-gray-600">
                        Nos spécialistes digitaux boostent votre présence en ligne
                      </p>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700">
                      <strong>Stratégie personnalisée :</strong> Que vous souhaitiez augmenter votre visibilité, 
                      engager votre communauté ou générer plus de réservations, nous adaptons nos services à vos objectifs.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Services Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {socialServices.map((service) => (
                  <MarketingServiceCard
                    key={service.id}
                    service={service}
                    onSelect={() => openModal(service.id)}
                  />
                ))}
              </div>

              {/* Avantages */}
              <Card className="mt-8 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4 text-center">Pourquoi choisir nos services ?</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <h4 className="font-semibold text-blue-800">Expertise Restaurant</h4>
                      <p className="text-sm text-blue-600">Spécialisés dans le secteur de la restauration</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <h4 className="font-semibold text-purple-800">Engagement Authentique</h4>
                      <p className="text-sm text-purple-600">Création d'une vraie communauté autour de votre marque</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <Heart className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <h4 className="font-semibold text-green-800">Résultats Mesurables</h4>
                      <p className="text-sm text-green-600">Rapports détaillés sur vos performances</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>

        {/* Modals */}
        {activeModal === 'gestion-reseaux' && (
          <GestionReseauxModal onClose={closeModal} />
        )}
        {activeModal === 'creation-contenu' && (
          <CreationContenuModal onClose={closeModal} />
        )}
        {activeModal === 'community-management' && (
          <CommunityManagementModal onClose={closeModal} />
        )}
        {activeModal === 'analyse-performance' && (
          <AnalysePerformanceModal onClose={closeModal} />
        )}
      </div>
    </SubscriptionGuard>
  );
};

export default Social;
