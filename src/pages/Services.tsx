
import React, { useState } from 'react';
import ModernSidebar from '../components/ModernSidebar';
import SubscriptionGuard from '@/components/SubscriptionGuard';
import { Headphones, Phone, UserCheck, ArrowRight } from 'lucide-react';
import SubscriptionPopup from '@/components/SubscriptionPopup';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Services: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const services = [
    {
      id: 'service-appel',
      title: 'Service d\'Appel',
      description: 'Gestion professionnelle de vos appels entrants avec prise de commandes et réservations 24/7',
      icon: Phone,
      color: 'from-green-500 to-emerald-600',
      route: '/service-appel',
      features: ['24/7 Disponibilité', 'Prise de commandes', 'Gestion réservations', 'Support multilingue']
    },
    {
      id: 'consulting',
      title: 'Consulting Restaurant',
      description: 'Expertise et conseils stratégiques personnalisés pour optimiser votre établissement',
      icon: UserCheck,
      color: 'from-purple-500 to-indigo-600',
      route: '/consulting',
      features: ['15+ années d\'expérience', 'Audit complet', 'Plan d\'action', 'Formation équipes']
    }
  ];

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
                    Choisissez le service adapté à vos besoins
                  </p>
                </div>
              </div>
            </div>
          </header>

          <main className="p-8 space-y-8">
            <div className="max-w-7xl mx-auto">
              {/* Hero Section */}
              <div className="bg-gradient-to-r from-green-600 via-purple-600 to-indigo-600 rounded-3xl p-8 lg:p-12 text-white shadow-2xl mb-8">
                <div className="text-center">
                  <h2 className="text-4xl font-black mb-4">Solutions professionnelles sur mesure</h2>
                  <p className="text-xl opacity-90 mb-6 max-w-3xl mx-auto">
                    Découvrez nos services experts pour optimiser votre restaurant et augmenter votre rentabilité
                  </p>
                </div>
              </div>

              {/* Services Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {services.map((service) => (
                  <Card key={service.id} className="border-0 shadow-xl bg-white/95 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 group">
                    <CardContent className="p-8">
                      <div className="flex items-start space-x-6 mb-6">
                        <div className={`w-16 h-16 bg-gradient-to-br ${service.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          <service.icon className="h-8 w-8 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-black text-gray-900 mb-3">{service.title}</h3>
                          <p className="text-gray-600 leading-relaxed">{service.description}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-6">
                        {service.features.map((feature, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <div className={`w-2 h-2 bg-gradient-to-r ${service.color} rounded-full`} />
                            <span className="text-sm text-gray-700 font-medium">{feature}</span>
                          </div>
                        ))}
                      </div>

                      <Button 
                        onClick={() => navigate(service.route)}
                        className={`w-full bg-gradient-to-r ${service.color} hover:opacity-90 text-white font-semibold py-3 group`}
                      >
                        <span>Découvrir ce service</span>
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Why Choose Us Section */}
              <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-sm mt-12">
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
                        <Headphones className="h-10 w-10 text-white" />
                      </div>
                      <h4 className="text-xl font-black mb-3">Résultats</h4>
                      <p className="text-gray-600">Amélioration mesurable de vos performances</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>

        <SubscriptionPopup />
      </div>
    </SubscriptionGuard>
  );
};

export default Services;
