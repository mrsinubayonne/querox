
import React, { useState } from 'react';
import ModernSidebar from '../components/ModernSidebar';
import SubscriptionGuard from '@/components/SubscriptionGuard';
import { UserCheck, CheckCircle, Award, Target, TrendingUp, Users } from 'lucide-react';
import ConsultingModal from '@/components/marketing/ConsultingModal';
import SubscriptionPopup from '@/components/SubscriptionPopup';
import { useIsMobile } from '@/hooks/use-mobile';
import MarketingServiceCard from '@/components/marketing/MarketingServiceCard';
import { Card, CardContent } from '@/components/ui/card';

const Consulting: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const isMobile = useIsMobile();

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
    <SubscriptionGuard feature="le service de consulting professionnel">
      <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
        <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        
        <div className="flex-1 overflow-auto">
          {/* Header */}
          <header className="bg-white/95 backdrop-blur-xl border-b border-gray-200/60 px-8 py-6 sticky top-0 z-20 shadow-sm">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <div className="flex items-center space-x-6">
                <div className="p-3 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 rounded-xl shadow-lg">
                  <UserCheck className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-black bg-gradient-to-r from-gray-900 via-purple-800 to-indigo-800 bg-clip-text text-transparent">
                    Consulting Restaurant
                  </h1>
                  <p className="text-lg text-gray-600 font-medium">
                    Expertise et conseils stratégiques pour votre restaurant
                  </p>
                </div>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg px-6 py-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-purple-600" />
                  <span className="text-lg font-semibold text-purple-800">Expert Consulting</span>
                </div>
              </div>
            </div>
          </header>

          <main className="p-8 space-y-8">
            <div className="max-w-7xl mx-auto">
              {/* Hero Section */}
              <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-3xl p-8 lg:p-12 text-white shadow-2xl mb-8">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                      <Award className="h-5 w-5 text-yellow-300" />
                      <span className="text-lg font-semibold">Expertise Premium</span>
                    </div>
                    <h2 className="text-4xl font-black mb-4">Consulting restaurant professionnel</h2>
                    <p className="text-xl opacity-90 mb-6">
                      Optimisez votre restaurant avec nos experts. 15+ années d'expérience.
                    </p>
                  </div>
                  <div className="hidden lg:flex space-x-8">
                    <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                      <div className="text-3xl font-black text-yellow-300">15+</div>
                      <div className="text-sm opacity-90">Années</div>
                    </div>
                    <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                      <div className="text-3xl font-black text-green-300">25%</div>
                      <div className="text-sm opacity-90">Économies</div>
                    </div>
                    <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                      <div className="text-3xl font-black text-blue-300">200+</div>
                      <div className="text-sm opacity-90">Clients</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Section */}
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

              {/* Services Section */}
              <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-sm mb-8">
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <h3 className="text-3xl font-black text-gray-900 mb-3">Nos domaines d'expertise</h3>
                    <p className="text-lg text-gray-600">Accompagnement complet pour votre réussite</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <Target className="h-10 w-10 text-white" />
                      </div>
                      <h4 className="text-xl font-black mb-3">Stratégie</h4>
                      <p className="text-gray-600">Définition d'objectifs et plan d'action personnalisé</p>
                    </div>
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <TrendingUp className="h-10 w-10 text-white" />
                      </div>
                      <h4 className="text-xl font-black mb-3">Optimisation</h4>
                      <p className="text-gray-600">Amélioration des processus et de la rentabilité</p>
                    </div>
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <Users className="h-10 w-10 text-white" />
                      </div>
                      <h4 className="text-xl font-black mb-3">Formation</h4>
                      <p className="text-gray-600">Montée en compétences de vos équipes</p>
                    </div>
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <Award className="h-10 w-10 text-white" />
                      </div>
                      <h4 className="text-xl font-black mb-3">Audit</h4>
                      <p className="text-gray-600">Analyse complète de votre établissement</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Service Card */}
              <div className="max-w-md mx-auto">
                {consultingServices.map((service) => (
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
          <ConsultingModal onClose={() => setShowModal(false)} />
        )}

        <SubscriptionPopup />
      </div>
    </SubscriptionGuard>
  );
};

export default Consulting;
