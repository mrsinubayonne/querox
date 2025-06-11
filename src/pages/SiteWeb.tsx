import React, { useState } from 'react';
import ModernSidebar from '../components/ModernSidebar';
import ImageUpload from '../components/ImageUpload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Eye, Save, Palette, Type, Layout, Star, MapPin, Phone, Mail, Image, Upload } from 'lucide-react';
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
    secondaryColor: '#d4af37',
    heroImage: '/lovable-uploads/eedf6dca-ced1-4275-a5ca-db24eefce183.png',
    galleryImages: [
      '/lovable-uploads/eedf6dca-ced1-4275-a5ca-db24eefce183.png',
      '/lovable-uploads/eedf6dca-ced1-4275-a5ca-db24eefce183.png',
      '/lovable-uploads/eedf6dca-ced1-4275-a5ca-db24eefce183.png'
    ]
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

  const handleImageChange = (field: string, imageUrl: string) => {
    setSiteConfig(prev => ({ ...prev, [field]: imageUrl }));
  };

  const handleGalleryImageChange = (index: number, imageUrl: string) => {
    setSiteConfig(prev => ({
      ...prev,
      galleryImages: prev.galleryImages.map((img, i) => i === index ? imageUrl : img)
    }));
  };

  const addGalleryImage = () => {
    setSiteConfig(prev => ({
      ...prev,
      galleryImages: [...prev.galleryImages, '/lovable-uploads/eedf6dca-ced1-4275-a5ca-db24eefce183.png']
    }));
  };

  const removeGalleryImage = (index: number) => {
    setSiteConfig(prev => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((_, i) => i !== index)
    }));
  };

  // Template moderne, élégant et classe avec images
  const renderPreview = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Navigation élégante avec ombre douce */}
      <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg"
                style={{ backgroundColor: siteConfig.primaryColor }}
              >
                {siteConfig.restaurantName.charAt(0)}
              </div>
              <h1 className="text-2xl font-bold tracking-tight" style={{ color: siteConfig.primaryColor }}>
                {siteConfig.restaurantName}
              </h1>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-gray-700 hover:text-gray-900 font-medium transition-colors duration-300">Accueil</a>
              <a href="#" className="text-gray-700 hover:text-gray-900 font-medium transition-colors duration-300">Menu</a>
              <a href="#" className="text-gray-700 hover:text-gray-900 font-medium transition-colors duration-300">Galerie</a>
              <a href="#" className="text-gray-700 hover:text-gray-900 font-medium transition-colors duration-300">À propos</a>
              <a href="#" className="text-gray-700 hover:text-gray-900 font-medium transition-colors duration-300">Contact</a>
            </div>
            <Button 
              className="text-white font-medium px-6 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              style={{ backgroundColor: siteConfig.secondaryColor }}
            >
              Réserver une table
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section avec image de fond */}
      <section className="relative py-32 px-6 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${siteConfig.heroImage})` }}
        >
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="mb-8">
            <div className="flex justify-center mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-current text-white drop-shadow-lg" />
              ))}
            </div>
            <p className="text-sm font-medium tracking-wider uppercase text-white/90 drop-shadow-lg">
              Restaurant Gastronomique
            </p>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold mb-8 tracking-tight text-white drop-shadow-2xl">
            {siteConfig.restaurantName}
          </h1>
          
          <p className="text-xl md:text-2xl text-white/95 mb-12 max-w-3xl mx-auto leading-relaxed font-light drop-shadow-lg">
            {siteConfig.description}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button 
              size="lg" 
              className="text-white font-medium px-10 py-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
              style={{ backgroundColor: siteConfig.primaryColor + 'E6' }}
            >
              Découvrir notre carte
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="font-medium px-10 py-4 rounded-full border-2 bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20 hover:shadow-lg transition-all duration-300"
            >
              Voir nos spécialités
            </Button>
          </div>
        </div>
      </section>

      {/* Section galerie d'images */}
      {siteConfig.galleryImages.length > 0 && (
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6" style={{ color: siteConfig.primaryColor }}>
                Notre univers en images
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Découvrez l'ambiance unique de notre restaurant à travers cette galerie
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {siteConfig.galleryImages.slice(0, 6).map((image, index) => (
                <div key={index} className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500">
                  <img 
                    src={image} 
                    alt={`${siteConfig.restaurantName} - Image ${index + 1}`}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Section caractéristiques avec animations */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold mb-6" style={{ color: siteConfig.primaryColor }}>
              Une expérience unique
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Nous combinons tradition culinaire et innovation pour vous offrir des moments inoubliables dans un cadre d'exception
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
              <div 
                className="w-20 h-20 rounded-2xl mx-auto mb-8 flex items-center justify-center text-white shadow-xl group-hover:shadow-2xl transition-all duration-300"
                style={{ backgroundColor: siteConfig.secondaryColor }}
              >
                <Star className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold mb-6" style={{ color: siteConfig.primaryColor }}>
                Cuisine Raffinée
              </h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Des plats créatifs préparés avec les meilleurs ingrédients locaux et importés par nos chefs passionnés
              </p>
            </div>
            
            <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
              <div 
                className="w-20 h-20 rounded-2xl mx-auto mb-8 flex items-center justify-center text-white shadow-xl group-hover:shadow-2xl transition-all duration-300"
                style={{ backgroundColor: siteConfig.secondaryColor }}
              >
                <Layout className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold mb-6" style={{ color: siteConfig.primaryColor }}>
                Ambiance Élégante
              </h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Un cadre sophistiqué et chaleureux conçu pour vos repas d'affaires ou moments privilégiés en famille
              </p>
            </div>
            
            <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
              <div 
                className="w-20 h-20 rounded-2xl mx-auto mb-8 flex items-center justify-center text-white shadow-xl group-hover:shadow-2xl transition-all duration-300"
                style={{ backgroundColor: siteConfig.secondaryColor }}
              >
                <Type className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold mb-6" style={{ color: siteConfig.primaryColor }}>
                Service Personnalisé
              </h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Une équipe professionnelle et attentionnée dédiée à faire de chaque visite un moment exceptionnel
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section contact moderne avec dégradé */}
      <section className="py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold mb-6 text-white">
              Nous contacter
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Réservez votre table ou contactez-nous pour plus d'informations
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 bg-white/95 backdrop-blur-sm transform hover:scale-105">
              <CardContent className="p-10 text-center">
                <div 
                  className="w-16 h-16 rounded-2xl mx-auto mb-8 flex items-center justify-center text-white shadow-xl"
                  style={{ backgroundColor: siteConfig.secondaryColor }}
                >
                  <Phone className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-4" style={{ color: siteConfig.primaryColor }}>
                  Téléphone
                </h3>
                <p className="text-gray-600 text-lg font-medium">{siteConfig.phone}</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 bg-white/95 backdrop-blur-sm transform hover:scale-105">
              <CardContent className="p-10 text-center">
                <div 
                  className="w-16 h-16 rounded-2xl mx-auto mb-8 flex items-center justify-center text-white shadow-xl"
                  style={{ backgroundColor: siteConfig.secondaryColor }}
                >
                  <Mail className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-4" style={{ color: siteConfig.primaryColor }}>
                  Email
                </h3>
                <p className="text-gray-600 text-lg font-medium">{siteConfig.email}</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 bg-white/95 backdrop-blur-sm transform hover:scale-105">
              <CardContent className="p-10 text-center">
                <div 
                  className="w-16 h-16 rounded-2xl mx-auto mb-8 flex items-center justify-center text-white shadow-xl"
                  style={{ backgroundColor: siteConfig.secondaryColor }}
                >
                  <MapPin className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-4" style={{ color: siteConfig.primaryColor }}>
                  Adresse
                </h3>
                <p className="text-gray-600 text-lg font-medium">{siteConfig.address}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer élégant avec dégradé */}
      <footer className="bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-3 mb-8">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-xl"
              style={{ backgroundColor: siteConfig.secondaryColor }}
            >
              {siteConfig.restaurantName.charAt(0)}
            </div>
            <h3 className="text-3xl font-bold">{siteConfig.restaurantName}</h3>
          </div>
          <p className="text-gray-300 mb-8 text-lg max-w-2xl mx-auto">{siteConfig.description}</p>
          <div className="flex justify-center space-x-2 mb-10">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-6 h-6 fill-current" style={{ color: siteConfig.secondaryColor }} />
            ))}
          </div>
          <div className="border-t border-gray-700 pt-8">
            <p className="text-gray-400 text-sm">
              © 2024 {siteConfig.restaurantName}. Tous droits réservés. Créé avec passion.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );

  if (previewMode) {
    return (
      <div className="min-h-screen">
        <header className="bg-white shadow-lg border-b fixed w-full top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <Button onClick={handlePreview} variant="outline" className="flex items-center gap-2 hover:bg-gray-50">
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
              <Button variant="outline" onClick={handlePreview} className="flex items-center gap-2 hover:bg-gray-50">
                <Eye size={16} />
                Aperçu
              </Button>
              <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 shadow-lg">
                <Save size={16} />
                Sauvegarder
              </Button>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Configuration */}
            <div className="space-y-6">
              {/* Informations du restaurant */}
              <Card className="shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <CardTitle className="flex items-center gap-2 text-gray-800">
                    <Type size={20} />
                    Informations du restaurant
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
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

              {/* Images du restaurant */}
              <Card className="shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                  <CardTitle className="flex items-center gap-2 text-gray-800">
                    <Image size={20} />
                    Images du restaurant
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Image principale (Hero)</Label>
                    <ImageUpload
                      currentImage={siteConfig.heroImage}
                      onImageChange={(imageUrl) => handleImageChange('heroImage', imageUrl)}
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-sm font-medium">Galerie d'images</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addGalleryImage}
                        className="flex items-center gap-2"
                      >
                        <Upload size={14} />
                        Ajouter
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {siteConfig.galleryImages.map((image, index) => (
                        <div key={index} className="relative">
                          <ImageUpload
                            currentImage={image}
                            onImageChange={(imageUrl) => handleGalleryImageChange(index, imageUrl)}
                          />
                          {siteConfig.galleryImages.length > 1 && (
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2 h-8 w-8 p-0"
                              onClick={() => removeGalleryImage(index)}
                            >
                              ×
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Personnalisation des couleurs */}
              <Card className="shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                  <CardTitle className="flex items-center gap-2 text-gray-800">
                    <Palette size={20} />
                    Personnalisation des couleurs
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
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
              <Card className="shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-yellow-50">
                  <CardTitle className="flex items-center gap-2 text-gray-800">
                    <Layout size={20} />
                    Aperçu en temps réel
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="border rounded-xl overflow-hidden shadow-xl">
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
                  
                  <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-700 font-medium">
                      ✨ Cliquez sur "Aperçu" pour voir votre site en plein écran avec toutes vos images
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
