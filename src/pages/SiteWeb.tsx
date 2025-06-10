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
  Utensils
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
      primary: '#059669',
      secondary: '#f59e0b',
      background: '#ffffff',
      text: '#1f2937'
    },
    template: 'restaurant-moderne',
    showReservations: true,
    showMenu: true,
    showContact: true,
    showSpecialties: true
  });

  const [previewMode, setPreviewMode] = useState(false);

  const templates = [
    { id: 'moderne', name: 'Moderne', description: 'Design épuré et contemporain' },
    { id: 'classique', name: 'Classique', description: 'Style traditionnel et élégant' },
    { id: 'minimal', name: 'Minimal', description: 'Simplicité et fonctionnalité' },
    { id: 'restaurant-moderne', name: 'Restaurant Moderne', description: 'Interface professionnelle pour restaurant' }
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

  if (previewMode && siteConfig.template === 'restaurant-moderne') {
    return (
      <div className="min-h-screen bg-white">
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
          {/* Navigation */}
          <nav className="bg-white shadow-sm py-4">
            <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
              <div className="text-2xl font-bold" style={{ color: siteConfig.colors.primary }}>
                {siteConfig.restaurantName}
              </div>
              <div className="hidden md:flex space-x-8">
                <a href="#accueil" className="text-gray-700 hover:text-green-600">Accueil</a>
                <a href="#menu" className="text-gray-700 hover:text-green-600">Menu</a>
                <a href="#specialites" className="text-gray-700 hover:text-green-600">Spécialités</a>
                <a href="#contact" className="text-gray-700 hover:text-green-600">Contact</a>
              </div>
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                Réserver
              </Button>
            </div>
          </nav>

          {/* Hero Section */}
          <section 
            id="accueil" 
            className="relative h-screen flex items-center justify-center bg-cover bg-center"
            style={{ 
              backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${siteConfig.heroImage})`,
            }}
          >
            <div className="text-center text-white max-w-4xl px-4">
              <h1 className="text-6xl font-bold mb-4">{siteConfig.restaurantName}</h1>
              <p className="text-xl mb-2">{siteConfig.description}</p>
              <p className="text-lg mb-8 opacity-90">{siteConfig.subtitle}</p>
              <div className="flex gap-4 justify-center">
                <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8">
                  Voir le menu
                </Button>
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-gray-900">
                  Réserver une table
                </Button>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-20 bg-gray-50">
            <div className="max-w-6xl mx-auto px-4">
              <div className="grid md:grid-cols-4 gap-8 text-center">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Award className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Qualité</h3>
                  <p className="text-gray-600 text-sm">Ingrédients frais et de qualité</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Utensils className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Cuisine</h3>
                  <p className="text-gray-600 text-sm">Plats authentiques et savoureux</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Users className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Service</h3>
                  <p className="text-gray-600 text-sm">Accueil chaleureux et professionnel</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <ShoppingBag className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Livraison</h3>
                  <p className="text-gray-600 text-sm">Service de livraison rapide</p>
                </div>
              </div>
            </div>
          </section>

          {/* Specialties Section */}
          {siteConfig.showSpecialties && (
            <section id="specialites" className="py-20">
              <div className="max-w-6xl mx-auto px-4">
                <div className="text-center mb-16">
                  <h2 className="text-4xl font-bold mb-4" style={{ color: siteConfig.colors.text }}>
                    Découvrez nos spécialités
                  </h2>
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    Une sélection de nos meilleurs plats, préparés avec passion par notre chef
                  </p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                  {specialties.map((item, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-6">
                        <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
                        <p className="text-gray-600 mb-4">{item.description}</p>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          style={{ borderColor: siteConfig.colors.primary, color: siteConfig.colors.primary }}
                        >
                          En savoir plus
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-center mt-12">
                  <Button 
                    size="lg" 
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Voir toutes nos spécialités
                  </Button>
                </div>
              </div>
            </section>
          )}

          {/* Contact Form Section */}
          {siteConfig.showContact && (
            <section id="contact" className="py-20 bg-gray-50">
              <div className="max-w-6xl mx-auto px-4">
                <div className="text-center mb-16">
                  <h2 className="text-4xl font-bold mb-4" style={{ color: siteConfig.colors.text }}>
                    Venez nous rendre visite
                  </h2>
                  <p className="text-gray-600">Contactez-nous pour réserver ou pour plus d'informations</p>
                </div>
                <div className="grid lg:grid-cols-2 gap-16">
                  {/* Contact Form */}
                  <div className="bg-white rounded-lg shadow-lg p-8">
                    <h3 className="text-2xl font-semibold mb-6">Nous contacter</h3>
                    <form className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>Nom</Label>
                          <Input placeholder="Votre nom" className="mt-1" />
                        </div>
                        <div>
                          <Label>Email</Label>
                          <Input type="email" placeholder="votre@email.com" className="mt-1" />
                        </div>
                      </div>
                      <div>
                        <Label>Téléphone</Label>
                        <Input placeholder="Votre numéro" className="mt-1" />
                      </div>
                      <div>
                        <Label>Nombre de personnes</Label>
                        <Select>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Sélectionner" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 personne</SelectItem>
                            <SelectItem value="2">2 personnes</SelectItem>
                            <SelectItem value="3">3 personnes</SelectItem>
                            <SelectItem value="4">4 personnes</SelectItem>
                            <SelectItem value="5+">5+ personnes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Message</Label>
                        <Textarea placeholder="Votre message..." className="mt-1" rows={4} />
                      </div>
                      <Button 
                        type="submit" 
                        size="lg" 
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                      >
                        Envoyer le message
                      </Button>
                    </form>
                  </div>

                  {/* Contact Info */}
                  <div className="bg-white rounded-lg shadow-lg p-8">
                    <h3 className="text-2xl font-semibold mb-6">Informations pratiques</h3>
                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <MapPin className="w-6 h-6 text-green-600 mt-1" />
                        <div>
                          <h4 className="font-semibold">Adresse</h4>
                          <p className="text-gray-600">{siteConfig.address}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <Phone className="w-6 h-6 text-green-600 mt-1" />
                        <div>
                          <h4 className="font-semibold">Téléphone</h4>
                          <p className="text-gray-600">{siteConfig.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <Mail className="w-6 h-6 text-green-600 mt-1" />
                        <div>
                          <h4 className="font-semibold">Email</h4>
                          <p className="text-gray-600">{siteConfig.email}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <Clock className="w-6 h-6 text-green-600 mt-1" />
                        <div>
                          <h4 className="font-semibold">Horaires</h4>
                          <p className="text-gray-600">{siteConfig.hours}</p>
                        </div>
                      </div>
                    </div>

                    {/* Map placeholder */}
                    <div className="mt-8 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500">Carte Google Maps</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Footer */}
          <footer className="bg-gray-900 text-white py-12">
            <div className="max-w-6xl mx-auto px-4">
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <h3 className="text-xl font-bold mb-4">{siteConfig.restaurantName}</h3>
                  <p className="text-gray-400">{siteConfig.description}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-4">Liens rapides</h4>
                  <div className="space-y-2">
                    <a href="#accueil" className="block text-gray-400 hover:text-white">Accueil</a>
                    <a href="#menu" className="block text-gray-400 hover:text-white">Menu</a>
                    <a href="#specialites" className="block text-gray-400 hover:text-white">Spécialités</a>
                    <a href="#contact" className="block text-gray-400 hover:text-white">Contact</a>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-4">Contact</h4>
                  <div className="space-y-2 text-gray-400">
                    <p>{siteConfig.address}</p>
                    <p>{siteConfig.phone}</p>
                    <p>{siteConfig.email}</p>
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                <p>&copy; 2024 {siteConfig.restaurantName}. Tous droits réservés.</p>
              </div>
            </div>
          </footer>
        </div>
      </div>
    );
  }

  // Keep existing preview for other templates
  if (previewMode) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
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
        <div className="min-h-screen" style={{ backgroundColor: siteConfig.colors.background }}>
          {/* Hero Section */}
          <section className="relative h-96 flex items-center justify-center" style={{ backgroundColor: siteConfig.colors.primary }}>
            <div className="text-center text-white">
              <h1 className="text-5xl font-bold mb-4">{siteConfig.restaurantName}</h1>
              <p className="text-xl mb-8">{siteConfig.description}</p>
              <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
                Voir le menu
              </Button>
            </div>
          </section>

          {/* Menu Section */}
          {siteConfig.showMenu && (
            <section className="py-16 px-4">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold text-center mb-12" style={{ color: siteConfig.colors.text }}>
                  Notre Menu
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {menuItems.map((item, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-2">{item.name}</h3>
                        <Badge variant="outline" className="mb-2">{item.category}</Badge>
                        <p className="text-lg font-bold" style={{ color: siteConfig.colors.primary }}>
                          {item.price}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Contact Section */}
          {siteConfig.showContact && (
            <section className="py-16 px-4" style={{ backgroundColor: siteConfig.colors.secondary + '20' }}>
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold text-center mb-12" style={{ color: siteConfig.colors.text }}>
                  Nous Contacter
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                  <div>
                    <Phone className="mx-auto mb-4" style={{ color: siteConfig.colors.primary }} />
                    <p>{siteConfig.phone}</p>
                  </div>
                  <div>
                    <Mail className="mx-auto mb-4" style={{ color: siteConfig.colors.primary }} />
                    <p>{siteConfig.email}</p>
                  </div>
                  <div>
                    <MapPin className="mx-auto mb-4" style={{ color: siteConfig.colors.primary }} />
                    <p>{siteConfig.address}</p>
                  </div>
                  <div>
                    <Clock className="mx-auto mb-4" style={{ color: siteConfig.colors.primary }} />
                    <p>{siteConfig.hours}</p>
                  </div>
                </div>
              </div>
            </section>
          )}
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
              <p className="text-gray-600">Créez et personnalisez le site web de votre restaurant</p>
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
                  <Tabs defaultValue="general" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="general">Général</TabsTrigger>
                      <TabsTrigger value="design">Design</TabsTrigger>
                      <TabsTrigger value="sections">Sections</TabsTrigger>
                    </TabsList>
                    
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
                        <Label>Template</Label>
                        <Select value={siteConfig.template} onValueChange={(value) => setSiteConfig(prev => ({ ...prev, template: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {templates.map((template) => (
                              <SelectItem key={template.id} value={template.id}>
                                {template.name} - {template.description}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
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
                    Aperçu du Site
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
                      {siteConfig.template === 'restaurant-moderne' ? (
                        <>
                          {/* Navigation Preview */}
                          <div className="bg-white p-4 border-b">
                            <div className="flex items-center justify-between">
                              <div className="font-bold text-green-600">{siteConfig.restaurantName}</div>
                              <div className="text-xs text-gray-600">Navigation</div>
                            </div>
                          </div>
                          
                          {/* Hero Preview */}
                          <div 
                            className="h-32 flex items-center justify-center text-white bg-cover bg-center relative"
                            style={{ 
                              backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${siteConfig.heroImage})`,
                            }}
                          >
                            <div className="text-center">
                              <h2 className="text-lg font-bold">{siteConfig.restaurantName}</h2>
                              <p className="text-sm">{siteConfig.description}</p>
                            </div>
                          </div>
                          
                          {/* Features Preview */}
                          <div className="p-4 bg-gray-50">
                            <div className="grid grid-cols-4 gap-2 text-center">
                              <div className="text-xs">
                                <div className="w-6 h-6 bg-green-100 rounded-full mx-auto mb-1 flex items-center justify-center">
                                  <Award size={12} className="text-green-600" />
                                </div>
                                <span>Qualité</span>
                              </div>
                              <div className="text-xs">
                                <div className="w-6 h-6 bg-green-100 rounded-full mx-auto mb-1 flex items-center justify-center">
                                  <Utensils size={12} className="text-green-600" />
                                </div>
                                <span>Cuisine</span>
                              </div>
                              <div className="text-xs">
                                <div className="w-6 h-6 bg-green-100 rounded-full mx-auto mb-1 flex items-center justify-center">
                                  <Users size={12} className="text-green-600" />
                                </div>
                                <span>Service</span>
                              </div>
                              <div className="text-xs">
                                <div className="w-6 h-6 bg-green-100 rounded-full mx-auto mb-1 flex items-center justify-center">
                                  <ShoppingBag size={12} className="text-green-600" />
                                </div>
                                <span>Livraison</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Specialties Preview */}
                          {siteConfig.showSpecialties && (
                            <div className="p-4">
                              <h3 className="text-sm font-bold mb-3 text-center">Nos Spécialités</h3>
                              <div className="grid grid-cols-3 gap-2">
                                {specialties.map((item, index) => (
                                  <div key={index} className="border rounded p-2 bg-white text-xs">
                                    <div className="h-16 bg-gray-200 rounded mb-1"></div>
                                    <div className="font-medium">{item.name}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Contact Preview */}
                          {siteConfig.showContact && (
                            <div className="p-4 bg-gray-50">
                              <h3 className="text-sm font-bold mb-3 text-center">Contact</h3>
                              <div className="grid grid-cols-2 gap-4 text-xs">
                                <div>
                                  <h4 className="font-medium mb-2">Formulaire</h4>
                                  <div className="space-y-1">
                                    <div className="h-4 bg-gray-200 rounded"></div>
                                    <div className="h-4 bg-gray-200 rounded"></div>
                                    <div className="h-6 bg-gray-200 rounded"></div>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-medium mb-2">Infos</h4>
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1">
                                      <Phone size={10} className="text-green-600" />
                                      <span className="text-xs">{siteConfig.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Mail size={10} className="text-green-600" />
                                      <span className="text-xs">{siteConfig.email}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          {/* Hero Section Preview */}
                          <div 
                            className="h-32 flex items-center justify-center text-white"
                            style={{ backgroundColor: siteConfig.colors.primary }}
                          >
                            <div className="text-center">
                              <h2 className="text-lg font-bold">{siteConfig.restaurantName}</h2>
                              <p className="text-sm">{siteConfig.description}</p>
                            </div>
                          </div>
                          
                          {/* Menu Preview */}
                          {siteConfig.showMenu && (
                            <div className="p-6">
                              <h3 className="text-lg font-bold mb-4 text-center">Notre Menu</h3>
                              <div className="grid grid-cols-2 gap-3">
                                {menuItems.slice(0, 4).map((item, index) => (
                                  <div key={index} className="border rounded p-2">
                                    <div className="text-sm font-medium">{item.name}</div>
                                    <div className="text-xs text-gray-600">{item.category}</div>
                                    <div 
                                      className="text-sm font-bold"
                                      style={{ color: siteConfig.colors.primary }}
                                    >
                                      {item.price}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Contact Preview */}
                          {siteConfig.showContact && (
                            <div 
                              className="p-6"
                              style={{ backgroundColor: siteConfig.colors.secondary + '20' }}
                            >
                              <h3 className="text-lg font-bold mb-4 text-center">Contact</h3>
                              <div className="text-sm space-y-2">
                                <div className="flex items-center gap-2">
                                  <Phone size={14} style={{ color: siteConfig.colors.primary }} />
                                  <span>{siteConfig.phone}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Mail size={14} style={{ color: siteConfig.colors.primary }} />
                                  <span>{siteConfig.email}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <MapPin size={14} style={{ color: siteConfig.colors.primary }} />
                                  <span>{siteConfig.address}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      )}
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

</edits_to_apply>
