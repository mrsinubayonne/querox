
import React, { useState } from 'react';
import ModernSidebar from '../components/ModernSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Eye, 
  Save, 
  Palette, 
  Layout, 
  Type, 
  Image,
  Phone,
  Mail,
  MapPin,
  Clock,
  Star,
  Award,
  Users,
  ShoppingBag,
  Utensils,
  Heart,
  Coffee,
  ChefHat
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SiteWeb: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { toast } = useToast();
  
  const [siteConfig, setSiteConfig] = useState({
    restaurantName: 'Mon Restaurant',
    description: 'Une expérience culinaire unique',
    subtitle: 'Découvrez une cuisine authentique dans un cadre chaleureux',
    phone: '+221 33 123 45 67',
    email: 'contact@monrestaurant.sn',
    address: 'Dakar, Sénégal',
    hours: 'Lun-Dim: 12h-23h',
    logo: '',
    heroImage: '/lovable-uploads/a3efddc0-fd23-4923-9d99-aca95a7a152a.png',
    colors: {
      primary: '#8B5A2B',
      secondary: '#D4AF37',
      background: '#FFF8DC',
      text: '#2C1810'
    },
    template: 'elegant-classique',
    showReservations: true,
    showMenu: true,
    showContact: true,
    showSpecialties: true
  });

  const [previewMode, setPreviewMode] = useState(false);

  const templates = [
    { 
      id: 'elegant-classique', 
      name: 'Élégant Classique', 
      description: 'Design sophistiqué avec typographie raffinée',
      colors: { primary: '#8B5A2B', secondary: '#D4AF37', background: '#FFF8DC', text: '#2C1810' }
    },
    { 
      id: 'moderne-minimaliste', 
      name: 'Moderne Minimaliste', 
      description: 'Lignes épurées et espaces blancs',
      colors: { primary: '#1A1A1A', secondary: '#FF6B35', background: '#FFFFFF', text: '#333333' }
    },
    { 
      id: 'chaleureux-rustique', 
      name: 'Chaleureux Rustique', 
      description: 'Ambiance chaleureuse avec textures naturelles',
      colors: { primary: '#8B4513', secondary: '#CD853F', background: '#F5F5DC', text: '#4A4A4A' }
    },
    { 
      id: 'vibrant-moderne', 
      name: 'Vibrant Moderne', 
      description: 'Couleurs vives et design dynamique',
      colors: { primary: '#E91E63', secondary: '#FF9800', background: '#FAFAFA', text: '#212121' }
    },
    { 
      id: 'mediterraneen-bleu', 
      name: 'Méditerranéen Bleu', 
      description: 'Inspiré des côtes méditerranéennes',
      colors: { primary: '#1976D2', secondary: '#FFD54F', background: '#F3F8FF', text: '#1A237E' }
    }
  ];

  const handleSave = () => {
    toast({
      title: "Site web sauvegardé",
      description: "Votre site web a été mis à jour avec succès.",
    });
  };

  const handlePreview = () => {
    setPreviewMode(!previewMode);
  };

  const handleTemplateChange = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSiteConfig(prev => ({
        ...prev,
        template: templateId,
        colors: template.colors
      }));
    }
  };

  const menuItems = [
    { name: "Thieboudienne", price: "2 500 CFA", category: "Plats principaux", image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9" },
    { name: "Yassa Poulet", price: "2 000 CFA", category: "Plats principaux", image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9" },
    { name: "Bissap", price: "500 CFA", category: "Boissons", image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9" }
  ];

  const specialties = [
    { name: "Plat du jour", description: "Spécialité quotidienne du chef", image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9" },
    { name: "Menu dégustation", description: "Une expérience culinaire complète", image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9" },
    { name: "Desserts maison", description: "Créations artisanales du pâtissier", image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9" }
  ];

  // Template Preview Components
  const renderTemplatePreview = () => {
    const template = siteConfig.template;
    const colors = siteConfig.colors;

    switch (template) {
      case 'elegant-classique':
        return (
          <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
            {/* Navigation Élégante */}
            <nav className="bg-white/90 backdrop-blur-sm shadow-lg py-6">
              <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
                <div className="text-3xl font-serif font-bold" style={{ color: colors.primary }}>
                  {siteConfig.restaurantName}
                </div>
                <div className="hidden md:flex space-x-8">
                  <a href="#" className="text-gray-700 hover:text-amber-600 font-medium transition-colors">Accueil</a>
                  <a href="#" className="text-gray-700 hover:text-amber-600 font-medium transition-colors">Menu</a>
                  <a href="#" className="text-gray-700 hover:text-amber-600 font-medium transition-colors">À propos</a>
                  <a href="#" className="text-gray-700 hover:text-amber-600 font-medium transition-colors">Contact</a>
                </div>
                <Button className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-full">
                  Réserver
                </Button>
              </div>
            </nav>

            {/* Hero Section Élégant */}
            <section className="relative h-screen flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-100"></div>
              <div className="relative text-center max-w-4xl px-4">
                <h1 className="text-7xl font-serif font-bold mb-6" style={{ color: colors.primary }}>
                  {siteConfig.restaurantName}
                </h1>
                <p className="text-2xl mb-4 font-light" style={{ color: colors.text }}>
                  {siteConfig.description}
                </p>
                <p className="text-lg mb-12 opacity-80" style={{ color: colors.text }}>
                  {siteConfig.subtitle}
                </p>
                <div className="flex gap-6 justify-center">
                  <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-white px-10 py-4 rounded-full text-lg">
                    Découvrir notre menu
                  </Button>
                  <Button size="lg" variant="outline" className="border-2 border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white px-10 py-4 rounded-full text-lg">
                    Réserver une table
                  </Button>
                </div>
              </div>
              <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2">
                <div className="w-6 h-10 border-2 border-amber-600 rounded-full flex justify-center">
                  <div className="w-1 h-3 bg-amber-600 rounded-full mt-2 animate-bounce"></div>
                </div>
              </div>
            </section>
          </div>
        );

      case 'moderne-minimaliste':
        return (
          <div className="min-h-screen bg-white">
            {/* Navigation Minimaliste */}
            <nav className="border-b border-gray-100 py-4">
              <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
                <div className="text-2xl font-bold tracking-tight" style={{ color: colors.primary }}>
                  {siteConfig.restaurantName.toUpperCase()}
                </div>
                <div className="hidden md:flex space-x-12">
                  <a href="#" className="text-gray-900 hover:text-orange-500 font-light tracking-wide">ACCUEIL</a>
                  <a href="#" className="text-gray-900 hover:text-orange-500 font-light tracking-wide">MENU</a>
                  <a href="#" className="text-gray-900 hover:text-orange-500 font-light tracking-wide">CONTACT</a>
                </div>
                <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-2">
                  RÉSERVER
                </Button>
              </div>
            </nav>

            {/* Hero Minimaliste */}
            <section className="h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center max-w-3xl px-4">
                <h1 className="text-8xl font-thin mb-8 tracking-tight" style={{ color: colors.primary }}>
                  {siteConfig.restaurantName}
                </h1>
                <div className="w-20 h-px bg-orange-500 mx-auto mb-8"></div>
                <p className="text-xl font-light mb-12 text-gray-600 leading-relaxed">
                  {siteConfig.description}
                </p>
                <Button size="lg" className="bg-black hover:bg-gray-800 text-white px-12 py-4 rounded-none text-sm tracking-widest">
                  EXPLORER
                </Button>
              </div>
            </section>
          </div>
        );

      case 'chaleureux-rustique':
        return (
          <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
            {/* Navigation Rustique */}
            <nav className="bg-white/95 shadow-md py-4">
              <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <ChefHat className="w-8 h-8 text-amber-700" />
                  <div className="text-2xl font-bold text-amber-900">
                    {siteConfig.restaurantName}
                  </div>
                </div>
                <div className="hidden md:flex space-x-6">
                  <a href="#" className="text-amber-800 hover:text-amber-600 font-medium">Accueil</a>
                  <a href="#" className="text-amber-800 hover:text-amber-600 font-medium">Menu</a>
                  <a href="#" className="text-amber-800 hover:text-amber-600 font-medium">Notre histoire</a>
                  <a href="#" className="text-amber-800 hover:text-amber-600 font-medium">Contact</a>
                </div>
                <Button className="bg-amber-700 hover:bg-amber-800 text-white px-6 py-2 rounded-lg">
                  Réserver
                </Button>
              </div>
            </nav>

            {/* Hero Rustique */}
            <section className="relative h-screen flex items-center justify-center bg-gradient-to-br from-amber-100 to-orange-200">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23D4AF37" fill-opacity="0.1"%3E%3Cpath d="m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
              <div className="relative text-center max-w-4xl px-4">
                <h1 className="text-6xl font-bold mb-6 text-amber-900">
                  Bienvenue chez {siteConfig.restaurantName}
                </h1>
                <p className="text-xl mb-6 text-amber-800 font-medium">
                  {siteConfig.description}
                </p>
                <p className="text-lg mb-10 text-amber-700">
                  {siteConfig.subtitle}
                </p>
                <div className="flex gap-4 justify-center">
                  <Button size="lg" className="bg-amber-700 hover:bg-amber-800 text-white px-8 py-3 rounded-lg">
                    <Utensils className="w-5 h-5 mr-2" />
                    Notre Menu
                  </Button>
                  <Button size="lg" variant="outline" className="border-2 border-amber-700 text-amber-700 hover:bg-amber-700 hover:text-white px-8 py-3 rounded-lg">
                    <Heart className="w-5 h-5 mr-2" />
                    Notre Histoire
                  </Button>
                </div>
              </div>
            </section>
          </div>
        );

      case 'vibrant-moderne':
        return (
          <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
            {/* Navigation Vibrante */}
            <nav className="bg-white/80 backdrop-blur-lg border-b border-pink-100 py-4">
              <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
                <div className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">
                  {siteConfig.restaurantName}
                </div>
                <div className="hidden md:flex space-x-8">
                  <a href="#" className="text-gray-700 hover:text-pink-500 font-semibold transition-colors">Accueil</a>
                  <a href="#" className="text-gray-700 hover:text-pink-500 font-semibold transition-colors">Menu</a>
                  <a href="#" className="text-gray-700 hover:text-pink-500 font-semibold transition-colors">Événements</a>
                  <a href="#" className="text-gray-700 hover:text-pink-500 font-semibold transition-colors">Contact</a>
                </div>
                <Button className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white px-6 py-2 rounded-full shadow-lg">
                  Réserver
                </Button>
              </div>
            </nav>

            {/* Hero Vibrant */}
            <section className="h-screen flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-400/20 to-orange-400/20"></div>
              <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-pink-400 to-orange-400 rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute bottom-20 left-20 w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-20 animate-pulse"></div>
              <div className="relative text-center max-w-5xl px-4">
                <h1 className="text-7xl font-bold mb-6 bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent">
                  {siteConfig.restaurantName}
                </h1>
                <p className="text-2xl mb-6 text-gray-700 font-medium">
                  {siteConfig.description}
                </p>
                <p className="text-lg mb-12 text-gray-600">
                  {siteConfig.subtitle}
                </p>
                <div className="flex gap-6 justify-center">
                  <Button size="lg" className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white px-10 py-4 rounded-full shadow-xl transform hover:scale-105 transition-all">
                    Découvrir
                  </Button>
                  <Button size="lg" variant="outline" className="border-2 border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white px-10 py-4 rounded-full">
                    Réserver
                  </Button>
                </div>
              </div>
            </section>
          </div>
        );

      case 'mediterraneen-bleu':
        return (
          <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
            {/* Navigation Méditerranéenne */}
            <nav className="bg-white shadow-sm py-5">
              <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
                    <Coffee className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-blue-800">
                    {siteConfig.restaurantName}
                  </div>
                </div>
                <div className="hidden md:flex space-x-8">
                  <a href="#" className="text-blue-800 hover:text-blue-600 font-medium">Accueil</a>
                  <a href="#" className="text-blue-800 hover:text-blue-600 font-medium">Menu</a>
                  <a href="#" className="text-blue-800 hover:text-blue-600 font-medium">Terrasse</a>
                  <a href="#" className="text-blue-800 hover:text-blue-600 font-medium">Contact</a>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
                  Réserver
                </Button>
              </div>
            </nav>

            {/* Hero Méditerranéen */}
            <section className="relative h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%231976D2" fill-opacity="0.03"%3E%3Ccircle cx="3" cy="3" r="3"/%3E%3Ccircle cx="13" cy="13" r="3"/%3E%3C/g%3E%3C/svg%3E')]"></div>
              <div className="relative text-center max-w-4xl px-4">
                <h1 className="text-6xl font-bold mb-6 text-blue-900">
                  {siteConfig.restaurantName}
                </h1>
                <p className="text-xl mb-6 text-blue-800 font-medium">
                  {siteConfig.description}
                </p>
                <p className="text-lg mb-10 text-blue-700">
                  {siteConfig.subtitle}
                </p>
                <div className="flex gap-4 justify-center">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg shadow-lg">
                    <MapPin className="w-5 h-5 mr-2" />
                    Notre Adresse
                  </Button>
                  <Button size="lg" variant="outline" className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-3 rounded-lg">
                    <Phone className="w-5 h-5 mr-2" />
                    Nous Appeler
                  </Button>
                </div>
              </div>
            </section>
          </div>
        );

      default:
        return <div className="h-96 bg-gray-100 flex items-center justify-center">
          <p className="text-gray-500">Aperçu du template non disponible</p>
        </div>;
    }
  };

  if (previewMode) {
    return (
      <div className="min-h-screen">
        {/* Header */}
        <header className="bg-white shadow-sm border-b fixed w-full top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button onClick={handlePreview} variant="outline">
                Retour à l'édition
              </Button>
              <h1 className="text-xl font-bold">{siteConfig.restaurantName}</h1>
            </div>
          </div>
        </header>

        {/* Preview Content */}
        <div className="pt-20">
          {renderTemplatePreview()}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Créateur de Site Web</h1>
              <p className="text-gray-600">Choisissez parmi nos nouveaux templates et personnalisez votre site</p>
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

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Configuration Panel */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Configuration du Site</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="templates" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="templates">Templates</TabsTrigger>
                      <TabsTrigger value="general">Général</TabsTrigger>
                      <TabsTrigger value="design">Design</TabsTrigger>
                      <TabsTrigger value="sections">Sections</TabsTrigger>
                    </TabsList>

                    <TabsContent value="templates" className="space-y-4">
                      <div>
                        <Label>Choisir un template</Label>
                        <div className="grid gap-3 mt-2">
                          {templates.map((template) => (
                            <div
                              key={template.id}
                              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                siteConfig.template === template.id
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() => handleTemplateChange(template.id)}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-sm">{template.name}</h3>
                                <div className="flex gap-1">
                                  {Object.values(template.colors).slice(0, 3).map((color, idx) => (
                                    <div
                                      key={idx}
                                      className="w-4 h-4 rounded-full border"
                                      style={{ backgroundColor: color }}
                                    ></div>
                                  ))}
                                </div>
                              </div>
                              <p className="text-xs text-gray-600">{template.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="general" className="space-y-4">
                      <div>
                        <Label htmlFor="restaurantName">Nom du restaurant</Label>
                        <Input
                          id="restaurantName"
                          value={siteConfig.restaurantName}
                          onChange={(e) => setSiteConfig(prev => ({ ...prev, restaurantName: e.target.value }))}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={siteConfig.description}
                          onChange={(e) => setSiteConfig(prev => ({ ...prev, description: e.target.value }))}
                        />
                      </div>

                      <div>
                        <Label htmlFor="subtitle">Sous-titre</Label>
                        <Textarea
                          id="subtitle"
                          value={siteConfig.subtitle}
                          onChange={(e) => setSiteConfig(prev => ({ ...prev, subtitle: e.target.value }))}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="phone">Téléphone</Label>
                        <Input
                          id="phone"
                          value={siteConfig.phone}
                          onChange={(e) => setSiteConfig(prev => ({ ...prev, phone: e.target.value }))}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          value={siteConfig.email}
                          onChange={(e) => setSiteConfig(prev => ({ ...prev, email: e.target.value }))}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="address">Adresse</Label>
                        <Input
                          id="address"
                          value={siteConfig.address}
                          onChange={(e) => setSiteConfig(prev => ({ ...prev, address: e.target.value }))}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="hours">Horaires</Label>
                        <Input
                          id="hours"
                          value={siteConfig.hours}
                          onChange={(e) => setSiteConfig(prev => ({ ...prev, hours: e.target.value }))}
                        />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="design" className="space-y-4">
                      <div>
                        <Label htmlFor="primaryColor">Couleur principale</Label>
                        <Input
                          id="primaryColor"
                          type="color"
                          value={siteConfig.colors.primary}
                          onChange={(e) => setSiteConfig(prev => ({ 
                            ...prev, 
                            colors: { ...prev.colors, primary: e.target.value }
                          }))}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="secondaryColor">Couleur secondaire</Label>
                        <Input
                          id="secondaryColor"
                          type="color"
                          value={siteConfig.colors.secondary}
                          onChange={(e) => setSiteConfig(prev => ({ 
                            ...prev, 
                            colors: { ...prev.colors, secondary: e.target.value }
                          }))}
                        />
                      </div>

                      <div>
                        <Label htmlFor="backgroundColor">Couleur de fond</Label>
                        <Input
                          id="backgroundColor"
                          type="color"
                          value={siteConfig.colors.background}
                          onChange={(e) => setSiteConfig(prev => ({ 
                            ...prev, 
                            colors: { ...prev.colors, background: e.target.value }
                          }))}
                        />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="sections" className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="showMenu">Afficher le menu</Label>
                        <Switch
                          id="showMenu"
                          checked={siteConfig.showMenu}
                          onCheckedChange={(checked) => setSiteConfig(prev => ({ ...prev, showMenu: checked }))}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="showSpecialties">Afficher les spécialités</Label>
                        <Switch
                          id="showSpecialties"
                          checked={siteConfig.showSpecialties}
                          onCheckedChange={(checked) => setSiteConfig(prev => ({ ...prev, showSpecialties: checked }))}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="showReservations">Afficher les réservations</Label>
                        <Switch
                          id="showReservations"
                          checked={siteConfig.showReservations}
                          onCheckedChange={(checked) => setSiteConfig(prev => ({ ...prev, showReservations: checked }))}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="showContact">Afficher le contact</Label>
                        <Switch
                          id="showContact"
                          checked={siteConfig.showContact}
                          onCheckedChange={(checked) => setSiteConfig(prev => ({ ...prev, showContact: checked }))}
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            {/* Preview Panel */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layout size={20} />
                    Aperçu du Template - {templates.find(t => t.id === siteConfig.template)?.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg overflow-hidden">
                    {/* Mini Preview */}
                    <div className="bg-gray-100 p-4 border-b">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                        <span className="ml-4">www.{siteConfig.restaurantName.toLowerCase().replace(/\s+/g, '')}.com</span>
                      </div>
                    </div>
                    
                    <div className="h-96 overflow-y-auto">
                      {renderTemplatePreview()}
                    </div>
                  </div>
                  
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      💡 Cliquez sur "Aperçu" pour voir votre site en plein écran avec le template sélectionné
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
