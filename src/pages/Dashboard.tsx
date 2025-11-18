import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  Menu, 
  Users, 
  DollarSign, 
  Package, 
  BarChart2,
  Globe,
  QrCode,
  MessageSquare
} from 'lucide-react';
import ModernSidebar from '@/components/ModernSidebar';
import SubscriptionGuard from '@/components/SubscriptionGuard';
import SubscriptionPopup from '@/components/SubscriptionPopup';
import { useState } from 'react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { toast } = useToast();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Display name logic
  const displayName = user?.user_metadata?.full_name || user?.email;

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const autoToken = params.get('auto_token');
    
    if (autoToken && user) {
      try {
        const tokenData = JSON.parse(atob(autoToken));
        const expiresAt = new Date(tokenData.expires_at);
        const now = new Date();
        
        if (expiresAt > now) {
          toast({
            title: "Accès autorisé",
            description: "Connexion via QR Code réussie",
            variant: "default",
          });
        } else {
          toast({
            title: "QR Code expiré",
            description: "Veuillez générer un nouveau QR Code",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "QR Code invalide",
          description: "Le code QR semble corrompu",
          variant: "destructive",
        });
      }
    }
  }, [location.search, user, toast]);

  const quickActions = [
    {
      title: "Gérer les Menus",
      description: "Créez et modifiez vos cartes de menu",
      icon: Menu,
      link: "/menus",
      color: "from-green-500 to-green-600"
    },
    {
      title: "Comptabilité",
      description: "Gérez vos finances et transactions",
      icon: DollarSign,
      link: "/comptabilite",
      color: "from-yellow-500 to-yellow-600"
    },
    {
      title: "Inventaire",
      description: "Suivez votre stock et approvisionnements",
      icon: Package,
      link: "/inventaire",
      color: "from-red-500 to-red-600"
    },
    {
      title: "Statistiques",
      description: "Analysez les performances de votre restaurant",
      icon: BarChart2,
      link: "/statistiques",
      color: "from-violet-500 to-violet-600"
    },
    {
      title: "Site Web",
      description: "Personnalisez votre présence en ligne",
      icon: Globe,
      link: "/site-web",
      color: "from-cyan-500 to-cyan-600"
    },
    {
      title: "QR Codes",
      description: "Générez des QR codes pour vos menus",
      icon: QrCode,
      link: "/qr-codes",
      color: "from-indigo-500 to-indigo-600"
    },
    {
      title: "Marketing",
      description: "Gérez vos campagnes marketing",
      icon: MessageSquare,
      link: "/marketing",
      color: "from-emerald-500 to-emerald-600"
    }
  ];

  return (
    <SubscriptionGuard feature="le tableau de bord">
      <div className="flex h-screen bg-gray-50">
        <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                Bienvenue sur QUEROX, {displayName}!
              </h1>
              <p className="text-gray-600 mt-2">
                Voici votre tableau de bord. Cliquez sur une fonctionnalité pour commencer à configurer votre restaurant.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quickActions.map((action, index) => (
                <Link key={index} to={action.link}>
                  <Card className="h-full hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer">
                    <CardHeader className="pb-3">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center mb-3`}>
                        <action.icon className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-lg">{action.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm mb-4">{action.description}</p>
                      <Button variant="outline" size="sm" className="w-full">
                        Configurer →
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Démarrage rapide</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium">1. Créez votre premier menu</span>
                    <Link to="/menus">
                      <Button size="sm">Commencer</Button>
                    </Link>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">2. Configurez votre site web</span>
                    <Link to="/site-web">
                      <Button size="sm" variant="outline">Configurer</Button>
                    </Link>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">3. Générez vos QR codes</span>
                    <Link to="/qr-codes">
                      <Button size="sm" variant="outline">Générer</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Fonctionnalités populaires</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Link to="/inventaire" className="block p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <Package className="h-5 w-5 text-red-600" />
                      <span className="font-medium">Gestion d'inventaire</span>
                    </div>
                  </Link>
                  <Link to="/comptabilite" className="block p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <DollarSign className="h-5 w-5 text-yellow-600" />
                      <span className="font-medium">Suivi financier</span>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
          </div>
        </div>
        <SubscriptionPopup />
      </SubscriptionGuard>
    );
  };
  
  export default Dashboard;
