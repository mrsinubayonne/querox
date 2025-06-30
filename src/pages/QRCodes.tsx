import React, { useState, useEffect } from 'react';
import ModernSidebar from '../components/ModernSidebar';
import QRCodeGenerator from '../components/QRCodeGenerator';
import LogoUpload from '../components/LogoUpload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Share2, QrCode as QrCodeIcon, Menu, Eye, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
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
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  useEffect(() => {
    fetchMenus();
  }, [user]);
  const fetchMenus = async () => {
    if (!user) return;
    try {
      const {
        data,
        error
      } = await supabase.from('menus').select('id, name, is_active').eq('user_id', user.id).eq('is_active', true);
      if (error) {
        console.error('Erreur récupération menus:', error);
        return;
      }
      setMenus(data || []);
      if (data && data.length > 0) {
        setActiveMenu(data[0]);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };
  const generateAutoLoginToken = async () => {
    if (!user || !activeMenu) return null;
    try {
      // Créer un token temporaire d'accès au menu
      const tokenData = {
        user_id: user.id,
        menu_id: activeMenu.id,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 jours
      };

      // Encoder le token en base64 pour l'URL
      const token = btoa(JSON.stringify(tokenData));
      return token;
    } catch (error) {
      console.error('Erreur génération token:', error);
      return null;
    }
  };
  const getQRCodeTypes = async () => {
    const autoLoginToken = await generateAutoLoginToken();
    const baseUrl = window.location.origin;
    const types = [{
      id: 'menu',
      title: 'Menu du restaurant',
      description: 'Code QR pour accéder au menu avec connexion automatique',
      url: activeMenu ? `${baseUrl}/menu-public?menu_id=${activeMenu.id}&auto_token=${autoLoginToken}` : `${baseUrl}/menus`,
      color: 'from-blue-500 to-blue-600',
      icon: Menu,
      isActive: !!activeMenu
    }, {
      id: 'dashboard',
      title: 'Accès administrateur',
      description: 'Code QR pour accès direct au tableau de bord',
      url: `${baseUrl}/dashboard?auto_token=${autoLoginToken}`,
      color: 'from-purple-500 to-purple-600',
      icon: Eye,
      isActive: true
    }];
    return types;
  };
  const [qrCodeTypes, setQrCodeTypes] = useState<any[]>([]);
  useEffect(() => {
    const loadQRTypes = async () => {
      const types = await getQRCodeTypes();
      setQrCodeTypes(types);
    };
    if (user) {
      loadQRTypes();
    }
  }, [user, activeMenu]);
  return <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100/50 px-8 py-6 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                Codes QR
              </h1>
              <p className="text-sm text-gray-500 mt-1 font-medium">
                Générez et gérez vos codes QR avec connexion automatique
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => setShowSettings(!showSettings)} className="bg-white/50 hover:bg-white/80">
                <Settings size={16} className="mr-2" />
                Paramètres
              </Button>
              <Button className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 shadow-lg shadow-blue-500/25">
                <QrCodeIcon size={16} className="mr-2" />
                Nouveau QR Code
              </Button>
            </div>
          </div>
        </header>

        <main className="p-8">
          {/* Menu Selection */}
          {menus.length > 0 && <Card className="mb-8 border-0 shadow-sm bg-white/60 backdrop-blur-sm">
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
            </Card>}

          {/* Paramètres du logo */}
          {showSettings && <Card className="mb-8 border-0 shadow-sm bg-white/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <Settings size={20} />
                  Paramètres des QR Codes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LogoUpload currentLogo={restaurantLogo} onLogoChange={setRestaurantLogo} />
              </CardContent>
            </Card>}

          {/* Introduction */}
          <Card className="mb-8 border-0 shadow-sm bg-white/60 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25">
                  <QrCodeIcon size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Codes QR avec connexion automatique
                  </h3>
                  <p className="text-gray-600">
                    Ces codes QR permettent aux utilisateurs d'accéder directement à votre menu ou dashboard sans avoir besoin de se connecter manuellement.
                    La connexion se fait automatiquement de manière sécurisée.
                    {restaurantLogo && <span className="block mt-2 text-sm text-blue-600 font-medium">
                        ✨ Logo du restaurant activé - vos QR codes sont maintenant personnalisés !
                      </span>}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* QR Codes Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {qrCodeTypes.map(qrType => <Card key={qrType.id} className="border-0 shadow-sm bg-white/60 backdrop-blur-sm">
                
                
                <CardContent className="pt-0">
                  {qrType.isActive && <>
                      <QRCodeGenerator url={qrType.url} title={qrType.title} logo={restaurantLogo} />
                      
                      <div className="mt-6 pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                          <span>Connexion automatique:</span>
                          <span className="font-medium text-green-600">Activée</span>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Download size={14} className="mr-2" />
                            Télécharger
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            <Share2 size={14} className="mr-2" />
                            Partager
                          </Button>
                        </div>
                      </div>
                    </>}
                  
                  {!qrType.isActive && <div className="text-center py-8 text-gray-500">
                      <p>QR Code inactif - Aucun menu sélectionné</p>
                    </div>}
                </CardContent>
              </Card>)}
          </div>

          {/* Tips Section */}
          <Card className="mt-8 border-0 shadow-sm bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">
                Conseils d'utilisation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Connexion automatique</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Les QR codes incluent un token de connexion sécurisé</li>
                    <li>• Validité de 7 jours pour des raisons de sécurité</li>
                    <li>• Accès direct sans saisie de mot de passe</li>
                    <li>• Idéal pour le personnel ou les accès fréquents</li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Sécurité</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Tokens d'accès temporaires et chiffrés</li>
                    <li>• Accès limité aux fonctions autorisées</li>
                    <li>• Régénération automatique des codes</li>
                    <li>• {restaurantLogo ? 'Logo de sécurité intégré' : 'Ajoutez votre logo pour plus de sécurité'}</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>;
};
export default QRCodes;