
import React, { useState } from 'react';
import ModernSidebar from '../components/ModernSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Eye, Save, Palette, Type, Layout } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SiteWeb: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { toast } = useToast();
  
  const [siteConfig, setSiteConfig] = useState({
    restaurantName: 'Mon Restaurant',
    description: 'Découvrez notre cuisine authentique',
    phone: '+221 33 123 45 67',
    email: 'contact@restaurant.sn',
    address: 'Dakar, Sénégal',
    primaryColor: '#2563eb',
    secondaryColor: '#f59e0b'
  });

  const [previewMode, setPreviewMode] = useState(false);

  const handleSave = () => {
    toast({
      title: "Site web sauvegardé",
      description: "Votre site web a été mis à jour avec succès.",
    });
  };

  const handlePreview = () => {
    setPreviewMode(!previewMode);
  };

  const handleInputChange = (field: string, value: string) => {
    setSiteConfig(prev => ({ ...prev, [field]: value }));
  };

  // Template simple et moderne
  const renderPreview = () => (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold" style={{ color: siteConfig.primaryColor }}>
              {siteConfig.restaurantName}
            </h1>
            <div className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-700 hover:text-gray-900">Accueil</a>
              <a href="#" className="text-gray-700 hover:text-gray-900">Menu</a>
              <a href="#" className="text-gray-700 hover:text-gray-900">Contact</a>
            </div>
            <Button 
              className="text-white"
              style={{ backgroundColor: siteConfig.primaryColor }}
            >
              Réserver
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl font-bold mb-6 text-gray-900">
            {siteConfig.restaurantName}
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {siteConfig.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="text-white"
              style={{ backgroundColor: siteConfig.primaryColor }}
            >
              Voir le menu
            </Button>
            <Button size="lg" variant="outline">
              Nous contacter
            </Button>
          </div>
        </div>
      </section>

      {/* Contact rapide */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-8" style={{ color: siteConfig.primaryColor }}>
            Nous contacter
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold mb-2">Téléphone</h3>
              <p className="text-gray-600">{siteConfig.phone}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Email</h3>
              <p className="text-gray-600">{siteConfig.email}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Adresse</h3>
              <p className="text-gray-600">{siteConfig.address}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );

  if (previewMode) {
    return (
      <div className="min-h-screen">
        <header className="bg-white shadow-sm border-b fixed w-full top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <Button onClick={handlePreview} variant="outline">
              Retour à l'éditeur
            </Button>
            <h1 className="text-xl font-bold">{siteConfig.restaurantName}</h1>
          </div>
        </header>
        <div className="pt-20">
          {renderPreview()}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Créateur de Site Web</h1>
              <p className="text-gray-600">Créez facilement votre site de restaurant</p>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={handlePreview} className="flex items-center gap-2">
                <Eye size={16} />
                Aperçu
              </Button>
              <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2">
                <Save size={16} />
                Sauvegarder
              </Button>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Configuration */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Type size={20} />
                    Informations générales
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="restaurantName">Nom du restaurant</Label>
                    <Input
                      id="restaurantName"
                      value={siteConfig.restaurantName}
                      onChange={(e) => handleInputChange('restaurantName', e.target.value)}
                      placeholder="Mon Restaurant"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={siteConfig.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Découvrez notre cuisine authentique"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      value={siteConfig.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+221 33 123 45 67"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={siteConfig.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="contact@restaurant.sn"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="address">Adresse</Label>
                    <Input
                      id="address"
                      value={siteConfig.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Dakar, Sénégal"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette size={20} />
                    Couleurs
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="primaryColor">Couleur principale</Label>
                    <Input
                      id="primaryColor"
                      type="color"
                      value={siteConfig.primaryColor}
                      onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="secondaryColor">Couleur secondaire</Label>
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={siteConfig.secondaryColor}
                      onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Aperçu */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layout size={20} />
                    Aperçu de votre site
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-100 p-3 border-b">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                        <span className="ml-4">www.{siteConfig.restaurantName.toLowerCase().replace(/\s+/g, '')}.com</span>
                      </div>
                    </div>
                    
                    <div className="h-96 overflow-y-auto">
                      {renderPreview()}
                    </div>
                  </div>
                  
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      💡 Cliquez sur "Aperçu" pour voir votre site en plein écran
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteWeb;
