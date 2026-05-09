
import React, { useState, useEffect } from 'react';
import ModernSidebar from '../components/ModernSidebar';
import QRCodeGenerator from '../components/QRCodeGenerator';
import LogoUpload from '../components/LogoUpload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QrCode as QrCodeIcon, Menu, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { APP_CONFIG } from '@/config/app.config';

interface MenuType {
  id: string;
  name: string;
  is_active: boolean;
}

const QRCodes: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [restaurantLogo, setRestaurantLogo] = useState<string | undefined>();
  const [showSettings, setShowSettings] = useState(false);
  const [menus, setMenus] = useState<MenuType[]>([]);
  const [activeMenu, setActiveMenu] = useState<MenuType | null>(null);
  const [restaurantSlug, setRestaurantSlug] = useState<string>('');
  const [outletSlug, setOutletSlug] = useState<string>('');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchMenus();
    fetchSlugs();
  }, [user]);

  const fetchSlugs = async () => {
    if (!user) return;
    try {
      const selectedOutletId = localStorage.getItem('selectedOutletId');
      const [{ data: profile }, { data: outlet }] = await Promise.all([
        supabase.from('profiles').select('restaurant_slug').eq('id', user.id).maybeSingle(),
        selectedOutletId
          ? supabase.from('outlets').select('slug').eq('id', selectedOutletId).maybeSingle()
          : supabase.from('outlets').select('slug').eq('user_id', user.id).limit(1).maybeSingle(),
      ]);
      setRestaurantSlug((profile as any)?.restaurant_slug || '');
      setOutletSlug((outlet as any)?.slug || '');
    } catch {}
  };

  const fetchMenus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('menus')
        .select('id, name, is_active')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) {
        return;
      }

      setMenus(data || []);
      if (data && data.length > 0) {
        setActiveMenu(data[0]);
      }
    } catch (error) {
      // Error handled silently
    }
  };

  const getMenuUrl = () => {
    if (restaurantSlug && outletSlug) {
      return APP_CONFIG.urls.getPublicMenuUrlBySlug(restaurantSlug, outletSlug);
    }
    if (!activeMenu) return '';
    return APP_CONFIG.urls.getPublicMenuUrl(activeMenu.id);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100/50 px-8 py-6 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                QR Code du Menu
              </h1>
              <p className="text-sm text-gray-500 mt-1 font-medium">
                Générez le QR code pour accéder à votre menu
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Button 
                variant="outline"
                onClick={() => setShowSettings(!showSettings)}
                className="bg-white/50 hover:bg-white/80"
              >
                <Settings size={16} className="mr-2" />
                Paramètres
              </Button>
            </div>
          </div>
        </header>

        <main className="p-8">
          {/* Menu Selection */}
          {menus.length > 0 && (
            <Card className="mb-8 border-0 shadow-sm bg-white/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">
                  Menu actif
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <span className="font-medium">{activeMenu?.name}</span>
                  <Badge variant="default">Actif</Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Paramètres du logo */}
          {showSettings && (
            <Card className="mb-8 border-0 shadow-sm bg-white/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <Settings size={20} />
                  Paramètres du QR Code
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LogoUpload 
                  currentLogo={restaurantLogo}
                  onLogoChange={setRestaurantLogo}
                />
              </CardContent>
            </Card>
          )}

          {/* Introduction */}
          <Card className="mb-8 border-0 shadow-sm bg-white/60 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25">
                  <QrCodeIcon size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    QR Code du Menu
                  </h3>
                  <p className="text-gray-600">
                    Ce QR code permet aux clients d'accéder directement au menu de votre restaurant.
                    Ils pourront consulter vos plats et passer commande facilement.
                    {restaurantLogo && (
                      <span className="block mt-2 text-sm text-blue-600 font-medium">
                        ✨ Logo du restaurant activé - votre QR code est personnalisé !
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* QR Code Principal */}
          {activeMenu ? (
            <Card className="border-0 shadow-sm bg-white/60 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg">
                      <Menu size={24} />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-900">
                        Menu du Restaurant
                      </CardTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        QR Code pour accéder au menu
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-green-50 text-green-700 border-green-200">
                    Actif
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <QRCodeGenerator 
                  url={getMenuUrl()}
                  title="Menu du Restaurant"
                  logo={restaurantLogo}
                />
                
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>Lien du menu:</span>
                    <span className="font-medium text-green-600">Disponible</span>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <code className="text-xs text-gray-700 break-all">
                      {getMenuUrl()}
                    </code>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-sm bg-white/60 backdrop-blur-sm">
              <CardContent className="text-center py-12">
                <div className="text-gray-500 mb-4">
                  <QrCodeIcon size={48} className="mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">Aucun menu actif</h3>
                  <p>Vous devez avoir un menu actif pour générer un QR code.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Conseils d'utilisation */}
          <Card className="mt-8 border-0 shadow-sm bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">
                Comment utiliser ce QR Code
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Utilisation</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Imprimez le QR code et placez-le sur vos tables</li>
                    <li>• Les clients scannent le code avec leur téléphone</li>
                    <li>• Ils accèdent directement au menu</li>
                    <li>• Ils peuvent consulter et commander</li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Avantages</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Accès instantané au menu</li>
                    <li>• Pas besoin de menus papier</li>
                    <li>• Facilite la commande en ligne</li>
                    <li>• {restaurantLogo ? 'QR code personnalisé avec votre logo' : 'Ajoutez votre logo pour personnaliser'}</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default QRCodes;
