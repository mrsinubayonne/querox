import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Globe, Settings, Eye, Palette, Plus, ExternalLink, Edit, RefreshCw } from "lucide-react";
import { useWebsites } from "@/hooks/useWebsites";
import CreateWebsiteModal from "@/components/CreateWebsiteModal";
import EditWebsiteModal from "@/components/EditWebsiteModal";
import WebsitePreviewModal from "@/components/WebsitePreviewModal";

const SiteWeb: React.FC = () => {
  const { websites, currentWebsite, loading, publishWebsite, unpublishWebsite, fetchWebsites } = useWebsites();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedWebsite, setSelectedWebsite] = useState<any>(null);

  console.log('SiteWeb component - websites:', websites, 'loading:', loading);

  const handlePublishToggle = async (websiteId: string, isPublished: boolean) => {
    console.log('Toggling publish status for website:', websiteId, 'current status:', isPublished);
    
    if (isPublished) {
      await unpublishWebsite(websiteId);
    } else {
      await publishWebsite(websiteId);
    }
  };

  const handleRefresh = () => {
    console.log('Refreshing websites list');
    fetchWebsites();
  };

  const handleEditWebsite = (website: any) => {
    console.log('Editing website:', website);
    setSelectedWebsite(website);
    setShowEditModal(true);
  };

  const handleViewWebsite = (website: any) => {
    console.log('Viewing website:', website);
    setSelectedWebsite(website);
    setShowPreviewModal(true);
  };

  // Auto-refresh when modal closes and a website was created
  useEffect(() => {
    if (!showCreateModal && websites.length > 0) {
      console.log('Modal closed, refreshing data');
      fetchWebsites();
    }
  }, [showCreateModal]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Site Web</h1>
            <p className="text-gray-600">Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Site Web</h1>
            <p className="text-gray-600">Créez et gérez le site web de votre restaurant</p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRefresh} className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Actualiser
            </Button>
            <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nouveau site
            </Button>
          </div>
        </div>

        {websites.length === 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader className="text-center pb-2">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>Aucun site web configuré</CardTitle>
                <CardDescription>
                  Créez un site web professionnel pour votre restaurant en quelques minutes
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button className="w-full mb-3" onClick={() => setShowCreateModal(true)}>
                  <Settings className="w-4 h-4 mr-2" />
                  Créer mon site web
                </Button>
                <Button variant="outline" className="w-full">
                  <Eye className="w-4 h-4 mr-2" />
                  Voir les modèles
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center pb-2">
                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Palette className="w-8 h-8 text-secondary" />
                </div>
                <CardTitle>Personnalisation</CardTitle>
                <CardDescription>
                  Personnalisez l'apparence et le contenu de votre site
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <p>• Ajoutez votre logo et vos couleurs</p>
                  <p>• Configurez vos informations</p>
                  <p>• Ajoutez vos menus et photos</p>
                </div>
                <Button variant="outline" className="w-full" disabled>
                  Personnaliser (créez d'abord un site)
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h3 className="text-green-800 font-medium mb-2">
                🎉 Félicitations ! Vous avez {websites.length} site{websites.length > 1 ? 's' : ''} web créé{websites.length > 1 ? 's' : ''}
              </h3>
              <p className="text-green-600 text-sm">
                Vous pouvez maintenant personnaliser votre site, ajouter du contenu et le publier.
              </p>
            </div>

            {/* Existing Websites */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {websites.map((website) => (
                <Card key={website.id} className="relative hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {website.logo_url && (
                            <img 
                              src={website.logo_url} 
                              alt={`Logo ${website.name}`}
                              className="w-8 h-8 object-cover rounded"
                            />
                          )}
                          <CardTitle className="text-lg">{website.name}</CardTitle>
                        </div>
                        <CardDescription>{website.description || 'Aucune description'}</CardDescription>
                      </div>
                      <Badge variant={website.is_published ? "default" : "secondary"}>
                        {website.is_published ? 'Publié' : 'Brouillon'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>Modèle:</strong> {website.template_id}</p>
                        {website.address && <p><strong>Adresse:</strong> {website.address}</p>}
                        {website.phone && <p><strong>Téléphone:</strong> {website.phone}</p>}
                        {website.email && <p><strong>Email:</strong> {website.email}</p>}
                        <p><strong>Créé le:</strong> {new Date(website.created_at).toLocaleDateString('fr-FR')}</p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => handleEditWebsite(website)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Modifier
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewWebsite(website)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Voir
                        </Button>
                      </div>
                      
                      <Button 
                        size="sm" 
                        className="w-full"
                        variant={website.is_published ? "destructive" : "default"}
                        onClick={() => handlePublishToggle(website.id, website.is_published)}
                      >
                        {website.is_published ? 'Dépublier' : 'Publier le site'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Fonctionnalités disponibles</CardTitle>
            <CardDescription>
              Votre site web inclura toutes ces fonctionnalités
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Affichage des menus</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Réservations en ligne</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Galerie photos</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Informations de contact</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Responsive mobile</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">SEO optimisé</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <CreateWebsiteModal 
          open={showCreateModal} 
          onOpenChange={setShowCreateModal} 
        />

        <EditWebsiteModal
          open={showEditModal}
          onOpenChange={setShowEditModal}
          website={selectedWebsite}
        />

        <WebsitePreviewModal
          open={showPreviewModal}
          onOpenChange={setShowPreviewModal}
          website={selectedWebsite}
        />
      </div>
    </div>
  );
};

export default SiteWeb;
