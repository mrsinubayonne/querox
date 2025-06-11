
import React, { useState } from 'react';
import ModernSidebar from '../components/ModernSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Save, Layout } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import TemplateSelector from '../components/configuration/TemplateSelector';
import GeneralConfigTab from '../components/configuration/GeneralConfigTab';
import DesignConfigTab from '../components/configuration/DesignConfigTab';
import SectionsConfigTab from '../components/configuration/SectionsConfigTab';
import TemplateRenderer from '../components/templates/TemplateRenderer';

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

  const handleConfigChange = (updates: any) => {
    setSiteConfig(prev => ({ ...prev, ...updates }));
  };

  const handleColorsChange = (colorUpdates: any) => {
    setSiteConfig(prev => ({
      ...prev,
      colors: { ...prev.colors, ...colorUpdates }
    }));
  };

  const handleSectionChange = (sectionUpdates: any) => {
    setSiteConfig(prev => ({ ...prev, ...sectionUpdates }));
  };

  if (previewMode) {
    return (
      <div className="min-h-screen">
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

        <div className="pt-20">
          <TemplateRenderer template={siteConfig.template} siteConfig={siteConfig} />
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
                      <TemplateSelector 
                        templates={templates}
                        selectedTemplate={siteConfig.template}
                        onTemplateChange={handleTemplateChange}
                      />
                    </TabsContent>
                    
                    <TabsContent value="general" className="space-y-4">
                      <GeneralConfigTab 
                        siteConfig={siteConfig}
                        onConfigChange={handleConfigChange}
                      />
                    </TabsContent>
                    
                    <TabsContent value="design" className="space-y-4">
                      <DesignConfigTab 
                        colors={siteConfig.colors}
                        onColorsChange={handleColorsChange}
                      />
                    </TabsContent>
                    
                    <TabsContent value="sections" className="space-y-4">
                      <SectionsConfigTab 
                        sectionConfig={{
                          showMenu: siteConfig.showMenu,
                          showSpecialties: siteConfig.showSpecialties,
                          showReservations: siteConfig.showReservations,
                          showContact: siteConfig.showContact
                        }}
                        onSectionChange={handleSectionChange}
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

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
                    <div className="bg-gray-100 p-4 border-b">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                        <span className="ml-4">www.{siteConfig.restaurantName.toLowerCase().replace(/\s+/g, '')}.com</span>
                      </div>
                    </div>
                    
                    <div className="h-96 overflow-y-auto">
                      <TemplateRenderer template={siteConfig.template} siteConfig={siteConfig} />
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
