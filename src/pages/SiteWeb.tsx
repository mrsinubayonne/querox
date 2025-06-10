
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
  Star
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SiteWeb: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { toast } = useToast();
  
  const [siteConfig, setSiteConfig] = useState({
    restaurantName: 'Mon Restaurant',
    description: 'Découvrez une cuisine authentique dans un cadre chaleureux',
    phone: '+221 33 123 45 67',
    email: 'contact@monrestaurant.sn',
    address: 'Dakar, Sénégal',
    hours: 'Lun-Dim: 12h-23h',
    logo: '',
    heroImage: '/lovable-uploads/eedf6dca-ced1-4275-a5ca-db24eefce183.png',
    colors: {
      primary: '#16a34a',
      secondary: '#f59e0b',
      background: '#ffffff',
      text: '#1f2937'
    },
    template: 'moderne',
    showReservations: true,
    showMenu: true,
    showContact: true
  });

  const [previewMode, setPreviewMode] = useState(false);

  const templates = [
    { id: 'moderne', name: 'Moderne', description: 'Design épuré et contemporain' },
    { id: 'classique', name: 'Classique', description: 'Style traditionnel et élégant' },
    { id: 'minimal', name: 'Minimal', description: 'Simplicité et fonctionnalité' }
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
    { name: "Thieboudienne", price: "2 500 CFA", category: "Plats principaux" },
    { name: "Yassa Poulet", price: "2 000 CFA", category: "Plats principaux" },
    { name: "Bissap", price: "500 CFA", category: "Boissons" }
  ];

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
