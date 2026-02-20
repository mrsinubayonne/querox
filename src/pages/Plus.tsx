
import React, { useState } from 'react';
import ModernSidebar from '../components/ModernSidebar';
import SubscriptionPopup from '@/components/SubscriptionPopup';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { UserPlus, Users, Award, QrCode, CreditCard, Globe, ArrowRight } from 'lucide-react';

const Plus: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();

  const items = [
    {
      icon: UserPlus,
      label: 'Clients (CRM)',
      description: 'Gérez votre base clients et fidélisez-les',
      path: '/clients',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Users,
      label: 'Équipe',
      description: 'Gérez les membres de votre équipe',
      path: '/equipe',
      color: 'from-violet-500 to-purple-500',
    },
    {
      icon: Award,
      label: 'Performance Personnel',
      description: 'Suivez les performances de votre personnel',
      path: '/performance-personnel',
      color: 'from-amber-500 to-orange-500',
    },
    {
      icon: QrCode,
      label: 'QR Codes',
      description: 'Créez et gérez vos QR codes',
      path: '/qr-codes',
      color: 'from-emerald-500 to-green-500',
    },
    {
      icon: CreditCard,
      label: 'Débiteurs',
      description: 'Suivez les créances et paiements en attente',
      path: '/debiteurs',
      color: 'from-rose-500 to-red-500',
    },
    {
      icon: Globe,
      label: 'Site Web',
      description: 'Configurez et gérez votre site web',
      path: '/site-web',
      color: 'from-indigo-500 to-blue-500',
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
      <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div className="flex-1 overflow-auto">
        <header className="bg-white/95 backdrop-blur-xl border-b border-gray-200/60 px-8 py-6 sticky top-0 z-20 shadow-sm">
          <h1 className="text-3xl font-black text-gray-900">Plus</h1>
          <p className="text-gray-600 mt-1">Accédez à toutes les fonctionnalités supplémentaires</p>
        </header>

        <main className="p-6 md:p-8">
          <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((item) => (
              <Card
                key={item.path}
                onClick={() => navigate(item.path)}
                className="border-0 shadow-lg bg-white/95 hover:shadow-xl transition-all duration-200 cursor-pointer group"
              >
                <CardContent className="p-6 flex flex-col items-start gap-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                    <item.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      {item.label}
                      <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>

      <SubscriptionPopup />
    </div>
  );
};

export default Plus;
