import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Globe,
  Settings,
  Eye,
  Palette,
  Plus,
  RefreshCw,
  Edit,
  CheckCircle2,
  Star,
  LayoutGrid,
  ArrowRight,
} from "lucide-react";
import { useWebsites } from "@/hooks/useWebsites";
import CreateWebsiteModal from "@/components/CreateWebsiteModal";
import EditWebsiteModal from "@/components/EditWebsiteModal";
import WebsitePreviewModal from "@/components/WebsitePreviewModal";
import WebsiteContentModal from "@/components/WebsiteContentModal";

const SiteWeb: React.FC = () => {
  const {
    websites,
    currentWebsite,
    loading,
    publishWebsite,
    unpublishWebsite,
    fetchWebsites,
  } = useWebsites();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedWebsite, setSelectedWebsite] = useState<any>(null);
  const [showContentModal, setShowContentModal] = useState(false);
  const [contentWebsiteId, setContentWebsiteId] = useState<string | null>(null);

  // Nouveau style de header avec hero et illustration
  function HeaderHero() {
    return (
      <div className="relative bg-gradient-to-tr from-primary/90 to-sky-200 rounded-3xl overflow-hidden mb-12 animate-fade-in">
        <div className="p-8 md:p-16 flex flex-col md:flex-row gap-8 items-center justify-between">
          <div className="flex-1">
            <h1 className="font-extrabold text-3xl md:text-4xl text-white drop-shadow mb-1 flex items-center gap-2">
              <Globe size={32} className="inline mb-1" />
              Votre site web de restaurant
            </h1>
            <p className="text-lg md:text-xl text-white/90 font-medium mb-5">
              Créez un site professionnel en quelques clics, attirez plus de clients et pilotez votre présence en ligne.
            </p>
            <div className="flex gap-3 mt-2 flex-wrap">
              <Button
                size="lg"
                className="shadow-xl"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus className="w-5 h-5 mr-2" />
                Créer un nouveau site
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-white/80 text-primary border-white/40 hover:bg-white/90"
                onClick={fetchWebsites}
              >
                <RefreshCw className="mr-2 w-4 h-4" />
                Actualiser
              </Button>
            </div>
          </div>
          <div className="flex-1 flex items-end justify-center">
            {/* illustration stylisée, remplaçable par une image si besoin */}
            <div className="w-52 h-52 bg-white/25 rounded-full flex items-center justify-center border-4 border-white/20 shadow-xl animate-scale-in">
              <Palette size={90} className="text-white/60" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Section fonctionnalités horizontale stylisée
  function FeaturesBar() {
    const features = [
      {
        icon: <LayoutGrid size={20} className="text-primary" />,
        label: "Menus en ligne",
      },
      {
        icon: <CheckCircle2 size={20} className="text-green-600" />,
        label: "Réservations facilités",
      },
      {
        icon: <Star size={20} className="text-yellow-400" />,
        label: "Galerie photos",
      },
      {
        icon: <Eye size={20} className="text-blue-400" />,
        label: "Responsive mobile",
      },
      {
        icon: <Globe size={20} className="text-indigo-500" />,
        label: "SEO optimisé",
      },
      {
        icon: <Settings size={20} className="text-pink-500" />,
        label: "Contenus personnalisables",
      },
    ];
    return (
      <section className="w-full my-8">
        <div className="bg-white rounded-xl border shadow flex flex-wrap gap-3 items-center justify-center px-4 py-2 md:py-4 animate-fade-in">
          {features.map((f, idx) => (
            <div
              key={idx}
              className="flex gap-2 items-center px-3 py-2 hover-scale"
            >
              {f.icon}
              <span className="text-sm md:text-base font-medium">{f.label}</span>
            </div>
          ))}
        </div>
      </section>
    );
  }

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
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="animate-fade-in text-center">
          <span className="inline-block animate-spin mr-2">
            <RefreshCw />
          </span>
          <span className="text-lg text-gray-700">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-2 md:px-8">
      <div className="max-w-7xl mx-auto flex flex-col">
        <HeaderHero />

        <FeaturesBar />

        {/* Bloc des sites */}
        {websites.length === 0 ? (
          <div className="mt-12 animate-fade-in">
            <Card className="mx-auto max-w-2xl border-dashed border-2 border-primary/40 shadow-lg">
              <CardHeader className="text-center pb-2">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-5 animate-scale-in">
                  <Globe className="w-10 h-10 text-primary" />
                </div>
                <CardTitle className="mb-1">
                  Bienvenue ! <span className="inline-block ml-1">🌟</span>
                </CardTitle>
                <CardDescription>
                  Lancez la présence en ligne de votre restaurant en créant votre premier site.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button
                  className="w-full mb-3"
                  size="lg"
                  onClick={() => setShowCreateModal(true)}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Créer mon site web
                </Button>
                {/* Juste un exemple, le bouton Voir les modèles pourrait ouvrir une modale de preview */}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowCreateModal(true)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Voir les modèles
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6 mt-4">
            <div className="mb-2 px-2">
              <h2 className="font-bold text-2xl text-gray-900 flex items-center gap-2">
                <LayoutGrid className="w-6 h-6 text-primary" />
                Mes sites web créés
              </h2>
              <p className="text-gray-500 text-base ml-1">
                Retrouvez et gérez vos présences en ligne
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
              {websites.map((website) => (
                <Card
                  key={website.id}
                  className="relative transition-transform hover:scale-105 shadow-md hover:shadow-2xl border border-gray-200 animate-fade-in"
                  style={{
                    borderTop:
                      website.is_published && website.primary_color
                        ? `6px solid ${website.primary_color}`
                        : undefined,
                  }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      {website.logo_url ? (
                        <img
                          src={website.logo_url}
                          alt={`Logo ${website.name}`}
                          className="w-10 h-10 object-cover rounded shadow-inner border border-white"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-secondary rounded flex items-center justify-center">
                          <Palette className="w-6 h-6 text-secondary-foreground" />
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-lg">{website.name}</CardTitle>
                        <CardDescription className="font-medium">{website.description || "Aucune description"}</CardDescription>
                      </div>
                    </div>
                    <Badge
                      variant={website.is_published ? "default" : "secondary"}
                      className="absolute top-3 right-3"
                    >
                      {website.is_published ? "Publié" : "Brouillon"}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-wrap gap-3 text-xs text-gray-500 font-medium mb-2">
                        <div>
                          <span className="font-semibold mr-1">Modèle :</span>
                          {website.template_id}
                        </div>
                        {website.address && (
                          <div>
                            <span className="font-semibold mr-1">Adresse :</span>
                            {website.address}
                          </div>
                        )}
                        {website.phone && (
                          <div>
                            <span className="font-semibold mr-1">Tél. :</span>
                            {website.phone}
                          </div>
                        )}
                        {website.email && (
                          <div>
                            <span className="font-semibold mr-1">Email :</span>
                            {website.email}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 mb-1">
                        Créé le :{" "}
                        {new Date(website.created_at).toLocaleDateString("fr-FR")}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-1/4"
                          onClick={() => {
                            setContentWebsiteId(website.id);
                            setShowContentModal(true);
                          }}
                        >
                          <Settings className="w-4 h-4 mr-1" />
                          Contenu
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-1/4"
                          onClick={() => {
                            setSelectedWebsite(website);
                            setShowEditModal(true);
                          }}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Modifier
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-1/4"
                          onClick={() => {
                            setSelectedWebsite(website);
                            setShowPreviewModal(true);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Voir
                        </Button>
                      </div>
                      <Button
                        size="sm"
                        className={`w-full mt-3 ${
                          website.is_published
                            ? "animate-pulse bg-destructive text-white"
                            : ""
                        }`}
                        variant={website.is_published ? "destructive" : "default"}
                        onClick={() =>
                          website.is_published
                            ? unpublishWebsite(website.id)
                            : publishWebsite(website.id)
                        }
                      >
                        {website.is_published ? "Dépublier" : "Publier le site"}
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Modaux de gestion */}
        <CreateWebsiteModal open={showCreateModal} onOpenChange={setShowCreateModal} />
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
        <WebsiteContentModal
          open={showContentModal}
          onOpenChange={(open) => {
            setShowContentModal(open);
            if (!open) setContentWebsiteId(null);
          }}
          websiteId={contentWebsiteId || ""}
        />
      </div>
    </div>
  );
};

export default SiteWeb;

// NOTE: Le fichier dépasse 300 lignes. Pensez à demander une refactorisation en plusieurs composants si vous souhaitez le rendre plus facilement maintenable !
