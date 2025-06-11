
import React, { useState } from 'react';
import ModernSidebar from '../components/ModernSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Eye, Save, Palette, Type, Layout, Star, MapPin, Phone, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SiteWeb: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { toast } = useToast();
  
  const [siteConfig, setSiteConfig] = useState({
    restaurantName: 'Le Gourmet',
    description: 'Une expérience culinaire d\'exception dans un cadre raffiné',
    phone: '+221 33 123 45 67',
    email: 'contact@legourmet.sn',
    address: 'Plateau, Dakar, Sénégal',
    primaryColor: '#1a1a1a',
    secondaryColor: '#d4af37'
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

  // Template moderne, élégant et classe
  const renderPreview = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Navigation élégante */}
      <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: siteConfig.primaryColor }}
              >
                {siteConfig.restaurantName.charAt(0)}
              </div>
              <h1 className="text-2xl font-bold tracking-tight" style={{ color: siteConfig.primaryColor }}>
                {siteConfig.restaurantName}
              </h1>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-gray-700 hover:text-gray-900 font-medium transition-colors">Accueil</a>
              <a href="#" className="text-gray-700 hover:text-gray-900 font-medium transition-colors">Menu</a>
              <a href="#" className="text-gray-700 hover:text-gray-900 font-medium transition-colors">À propos</a>
              <a href="#" className="text-gray-700 hover:text-gray-900 font-medium transition-colors">Contact</a>
            </div>
            <Button 
              className="text-white font-medium px-6 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              style={{ backgroundColor: siteConfig.secondaryColor }}
            >
              Réserver une table
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section raffinée */}
      <section className="relative py-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/5 to-black/10"></div>
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="mb-6">
            <div className="flex justify-center mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-current" style={{ color: siteConfig.secondaryColor }} />
              ))}
            </div>
            <p className="text-sm font-medium tracking-wider uppercase" style={{ color: siteConfig.secondaryColor }}>
              Restaurant Gastronomique
            </p>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold mb-6 tracking-tight" style={{ color: siteConfig.primaryColor }}>
            {siteConfig.restaurantName}
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
            {siteConfig.description}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button 
              size="lg" 
              className="text-white font-medium px-8 py-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              style={{ backgroundColor: siteConfig.primaryColor }}
            >
              Découvrir notre carte
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="font-medium px-8 py-4 rounded-full border-2 hover:shadow-lg transition-all duration-300"
              style={{ borderColor: siteConfig.secondaryColor, color: siteConfig.secondaryColor }}
            >
              Voir nos spécialités
            </Button>
          </div>
        </div>
      </section>

      {/* Section caractéristiques */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{ color: siteConfig.primaryColor }}>
              Une expérience unique
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Nous combinons tradition culinaire et innovation pour vous offrir des moments inoubliables
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div 
                className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                style={{ backgroundColor: siteConfig.secondaryColor }}
              >
                <Star className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-4" style={{ color: siteConfig.primaryColor }}>
                Cuisine Raffinée
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Des plats créatifs préparés avec les meilleurs ingrédients locaux et importés
              </p>
            </div>
            
            <div className="text-center group">
              <div 
                className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                style={{ backgroundColor: siteConfig.secondaryColor }}
              >
                <Layout className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-4" style={{ color: siteConfig.primaryColor }}>
                Ambiance Élégante
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Un cadre sophistiqué et chaleureux pour vos repas d'affaires ou moments en famille
              </p>
            </div>
            
            <div className="text-center group">
              <div 
                className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                style={{ backgroundColor: siteConfig.secondaryColor }}
              >
                <Type className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-4" style={{ color: siteConfig.primaryColor }}>
                Service Personnalisé
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Une équipe professionnelle dédiée à faire de votre visite un moment exceptionnel
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section contact moderne */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{ color: siteConfig.primaryColor }}>
              Nous contacter
            </h2>
            <p className="text-xl text-gray-600">
              Réservez votre table ou contactez-nous pour plus d'informations
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white">
              <CardContent className="p-8 text-center">
                <div 
                  className="w-14 h-14 rounded-full mx-auto mb-6 flex items-center justify-center text-white shadow-lg"
                  style={{ backgroundColor: siteConfig.secondaryColor }}
                >
                  <Phone className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold mb-3" style={{ color: siteConfig.primaryColor }}>
                  Téléphone
                </h3>
                <p className="text-gray-600 text-lg">{siteConfig.phone}</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white">
              <CardContent className="p-8 text-center">
                <div 
                  className="w-14 h-14 rounded-full mx-auto mb-6 flex items-center justify-center text-white shadow-lg"
                  style={{ backgroundColor: siteConfig.secondaryColor }}
                >
                  <Mail className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold mb-3" style={{ color: siteConfig.primaryColor }}>
                  Email
                </h3>
                <p className="text-gray-600 text-lg">{siteConfig.email}</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white">
              <CardContent className="p-8 text-center">
                <div 
                  className="w-14 h-14 rounded-full mx-auto mb-6 flex items-center justify-center text-white shadow-lg"
                  style={{ backgroundColor: siteConfig.secondaryColor }}
                >
                  <MapPin className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold mb-3" style={{ color: siteConfig.primaryColor }}>
                  Adresse
                </h3>
                <p className="text-gray-600 text-lg">{siteConfig.address}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer élégant */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
              style={{ backgroundColor: siteConfig.secondaryColor }}
            >
              {siteConfig.restaurantName.charAt(0)}
            </div>
            <h3 className="text-2xl font-bold">{siteConfig.restaurantName}</h3>
          </div>
          <p className="text-gray-400 mb-6">{siteConfig.description}</p>
          <div className="flex justify-center space-x-4 mb-8">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-current" style={{ color: siteConfig.secondaryColor }} />
            ))}
          </div>
          <p className="text-gray-500 text-sm">
            © 2024 {siteConfig.restaurantName}. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );

  if (previewMode) {
    return (
      <div className="min-h-screen">
        <header className="bg-white shadow-sm border-b fixed w-full top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <Button onClick={handlePreview} variant="outline" className="flex items-center gap-2">
              <Layout size={16} />
              Retour à l'éditeur
            </Button>
            <h1 className="text-xl font-bold">{siteConfig.restaurantName}</h1>
            <div></div>
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
              <p className="text-gray-600">Créez un site élégant et professionnel pour votre restaurant</p>
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
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Type size={20} />
                    Informations du restaurant
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="restaurantName" className="text-sm font-medium">Nom du restaurant</Label>
                    <Input
                      id="restaurantName"
                      value={siteConfig.restaurantName}
                      onChange={(e) => handleInputChange('restaurantName', e.target.value)}
                      placeholder="Le Gourmet"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                    <Textarea
                      id="description"
                      value={siteConfig.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Une expérience culinaire d'exception..."
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone" className="text-sm font-medium">Téléphone</Label>
                      <Input
                        id="phone"
                        value={siteConfig.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="+221 33 123 45 67"
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                      <Input
                        id="email"
                        value={siteConfig.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="contact@restaurant.sn"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="address" className="text-sm font-medium">Adresse</Label>
                    <Input
                      id="address"
                      value={siteConfig.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Plateau, Dakar, Sénégal"
                      className="mt-1"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette size={20} />
                    Personnalisation des couleurs
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="primaryColor" className="text-sm font-medium">Couleur principale</Label>
                    <div className="flex items-center gap-3 mt-2">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={siteConfig.primaryColor}
                        onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                        className="w-20 h-12"
                      />
                      <Input
                        value={siteConfig.primaryColor}
                        onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                        placeholder="#1a1a1a"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="secondaryColor" className="text-sm font-medium">Couleur d'accent</Label>
                    <div className="flex items-center gap-3 mt-2">
                      <Input
                        id="secondaryColor"
                        type="color"
                        value={siteConfig.secondaryColor}
                        onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                        className="w-20 h-12"
                      />
                      <Input
                        value={siteConfig.secondaryColor}
                        onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                        placeholder="#d4af37"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Aperçu */}
            <div>
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layout size={20} />
                    Aperçu en temps réel
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-xl overflow-hidden shadow-lg">
                    <div className="bg-gray-100 p-4 border-b flex items-center gap-2">
                      <div className="flex gap-2">
                        <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      </div>
                      <div className="flex-1 bg-white rounded-lg px-4 py-1 text-sm text-gray-600 mx-4">
                        www.{siteConfig.restaurantName.toLowerCase().replace(/\s+/g, '')}.com
                      </div>
                    </div>
                    
                    <div className="h-96 overflow-y-auto bg-white">
                      <div className="transform scale-75 origin-top-left" style={{ width: '133.33%' }}>
                        {renderPreview()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-700 font-medium">
                      ✨ Cliquez sur "Aperçu" pour voir votre site en plein écran
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
