import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRestaurantSettings } from "@/hooks/useRestaurantSettings";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Globe, CheckCircle2, AlertCircle, Copy } from "lucide-react";
import { APP_CONFIG } from "@/config/app.config";

const DomainTab: React.FC = () => {
  const { website, loading } = useRestaurantSettings();
  const { toast } = useToast();
  const [slug, setSlug] = useState('');
  const [customDomain, setCustomDomain] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    if (website) {
      setSlug(website.slug || '');
      setCustomDomain(website.domain || '');
    }
  }, [website]);

  const checkSlugAvailability = async (newSlug: string) => {
    if (!newSlug || !website) return;
    
    const { data, error } = await supabase
      .from('websites')
      .select('id')
      .eq('slug', newSlug)
      .neq('id', website.id)
      .maybeSingle();

    setSlugAvailable(!data);
  };

  const handleSlugChange = (value: string) => {
    const sanitized = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setSlug(sanitized);
    checkSlugAvailability(sanitized);
  };

  const handleSaveSlug = async () => {
    if (!website || !slug) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('websites')
        .update({ slug, is_published: true })
        .eq('id', website.id);

      if (error) throw error;

      toast({
        title: "Site publié",
        description: `Votre site est maintenant accessible sur ${APP_CONFIG.urls.getPublicWebsiteUrl(slug)}`,
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveCustomDomain = async () => {
    if (!website) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('websites')
        .update({ domain: customDomain || null })
        .eq('id', website.id);

      if (error) throw error;

      toast({
        title: "Domaine personnalisé enregistré",
        description: customDomain 
          ? "Suivez les instructions DNS ci-dessous pour finaliser la configuration" 
          : "Domaine personnalisé retiré",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copié",
      description: "L'information a été copiée dans le presse-papiers",
    });
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  const queroxDomain = slug ? APP_CONFIG.urls.getSubdomain(slug) : APP_CONFIG.urls.getSubdomain('votre-restaurant');

  return (
    <div className="space-y-6">
      {/* Sous-domaine Querox */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Sous-domaine Querox
          </CardTitle>
          <CardDescription>
            Choisissez votre sous-domaine gratuit sur querox.me
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="slug">Sous-domaine</Label>
            <div className="flex gap-2">
              <div className="flex-1 flex items-center gap-2">
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="mon-restaurant"
                  className="flex-1"
                />
                <span className="text-muted-foreground whitespace-nowrap">.{APP_CONFIG.domains.main}</span>
              </div>
            </div>
            {slugAvailable === false && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                Ce sous-domaine n'est pas disponible
              </p>
            )}
            {slugAvailable === true && (
              <p className="text-sm text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" />
                Ce sous-domaine est disponible
              </p>
            )}
          </div>

          <Alert>
            <Globe className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>
                Votre site sera accessible sur: <strong>{APP_CONFIG.urls.getPublicWebsiteUrl(slug || 'votre-slug')}</strong>
              </span>
              {slug && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    copyToClipboard(APP_CONFIG.urls.getPublicWebsiteUrl(slug));
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              )}
            </AlertDescription>
          </Alert>

          {slug && (
            <Button 
              variant="outline"
              onClick={() => window.open(`/w/${slug}`, '_blank')}
              className="w-full"
            >
              <Globe className="h-4 w-4 mr-2" />
              Voir le site en ligne
            </Button>
          )}

          <Button 
            onClick={handleSaveSlug} 
            disabled={isSaving || !slug || slugAvailable === false}
            className="w-full"
          >
            {isSaving ? "Publication..." : "Publier le site"}
          </Button>
        </CardContent>
      </Card>

      {/* Domaine personnalisé */}
      <Card>
        <CardHeader>
          <CardTitle>Domaine personnalisé</CardTitle>
          <CardDescription>
            Connectez votre propre nom de domaine (ex: www.monrestaurant.com)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="custom-domain">Nom de domaine</Label>
            <Input
              id="custom-domain"
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
              placeholder="www.monrestaurant.com"
            />
          </div>

          <Button 
            onClick={handleSaveCustomDomain} 
            disabled={isSaving}
            variant="outline"
            className="w-full"
          >
            {isSaving ? "Enregistrement..." : "Enregistrer le domaine personnalisé"}
          </Button>

          {customDomain && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="space-y-3">
                <p className="font-semibold">Configuration DNS requise:</p>
                <div className="space-y-2 text-sm">
                  <div className="bg-muted p-3 rounded space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-mono">Type: A</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => copyToClipboard('A')}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-mono">Nom: @</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => copyToClipboard('@')}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-mono">Valeur: 185.158.133.1</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => copyToClipboard('185.158.133.1')}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-muted-foreground">
                    Ajoutez cet enregistrement DNS chez votre fournisseur de domaine. 
                    La propagation peut prendre jusqu'à 48 heures.
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DomainTab;
