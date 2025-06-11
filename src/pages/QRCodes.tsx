
import React, { useState } from 'react';
import ModernSidebar from '../components/ModernSidebar';
import QRCodeGenerator from '../components/QRCodeGenerator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Share2, QrCode as QrCodeIcon, Menu, Eye } from 'lucide-react';

const QRCodes: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const qrCodeTypes = [
    {
      id: 'menu',
      title: 'Menu du restaurant',
      description: 'Code QR pour accéder au menu complet',
      url: `${window.location.origin}/menus`,
      color: 'from-blue-500 to-blue-600',
      icon: Menu,
      isActive: true
    },
    {
      id: 'website',
      title: 'Site web principal',
      description: 'Code QR vers la page d\'accueil',
      url: `${window.location.origin}`,
      color: 'from-purple-500 to-purple-600',
      icon: Eye,
      isActive: true
    }
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
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
                Générez et gérez vos codes QR pour le restaurant
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Button className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 shadow-lg shadow-blue-500/25">
                <QrCodeIcon size={16} className="mr-2" />
                Nouveau QR Code
              </Button>
            </div>
          </div>
        </header>

        <main className="p-8">
          {/* Introduction */}
          <Card className="mb-8 border-0 shadow-sm bg-white/60 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25">
                  <QrCodeIcon size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Facilitez l'accès à votre menu
                  </h3>
                  <p className="text-gray-600">
                    Créez des codes QR pour permettre à vos clients d'accéder facilement à votre menu depuis leur smartphone. 
                    Placez ces codes sur vos tables, à l'entrée ou sur vos supports marketing.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* QR Codes Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {qrCodeTypes.map((qrType) => (
              <Card key={qrType.id} className="border-0 shadow-sm bg-white/60 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-2xl bg-gradient-to-br ${qrType.color} text-white shadow-lg`}>
                        <qrType.icon size={24} />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-gray-900">
                          {qrType.title}
                        </CardTitle>
                        <p className="text-sm text-gray-500 mt-1">
                          {qrType.description}
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
                    url={qrType.url}
                    title={qrType.title}
                  />
                  
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>URL de destination:</span>
                      <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                        {qrType.url}
                      </span>
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
                </CardContent>
              </Card>
            ))}
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
                  <h4 className="font-semibold text-gray-900">Placement optimal</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Sur chaque table du restaurant</li>
                    <li>• À l'entrée pour les clients qui attendent</li>
                    <li>• Sur vos supports marketing (flyers, cartes de visite)</li>
                    <li>• Dans vos réseaux sociaux</li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Bonnes pratiques</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Testez régulièrement que le QR code fonctionne</li>
                    <li>• Assurez-vous que la taille est suffisante pour être scanné</li>
                    <li>• Ajoutez un texte explicatif ("Scannez pour voir le menu")</li>
                    <li>• Gardez le design simple et contrasté</li>
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
