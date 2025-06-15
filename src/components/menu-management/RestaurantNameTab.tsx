
import React, { useState, useEffect } from "react";
import { useRestaurantSettings } from "@/hooks/useRestaurantSettings";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import SimpleImageUploader from "@/components/SimpleImageUploader";

const RestaurantNameTab = () => {
  const { website, loading, isSaving, updateWebsiteInfo } = useRestaurantSettings();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);
  const [headerUrl, setHeaderUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (website) {
      setName(website.name);
      setDescription(website.description ?? '');
      setLogoUrl(website.logo_url ?? undefined);
      setHeaderUrl(website.header_image_url ?? undefined);
    }
  }, [website]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!website) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-600">Aucune information de restaurant n’a été trouvée.</p>
      </div>
    );
  }

  const hasChanged = (
    name !== website.name ||
    description !== (website.description ?? '') ||
    logoUrl !== (website.logo_url ?? undefined) ||
    headerUrl !== (website.header_image_url ?? undefined)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations générales du restaurant</CardTitle>
        <CardDescription>Définissez les informations principales de votre restaurant (nom, description, logo, image d'en-tête).</CardDescription>
      </CardHeader>
      <CardContent className="pt-8 space-y-6">
        <div className="space-y-2">
          <label htmlFor="restaurant-name" className="text-sm font-medium">
            Nom du restaurant
          </label>
          <Input
            id="restaurant-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="restaurant-desc" className="text-sm font-medium">
            Description du restaurant
          </label>
          <Textarea
            id="restaurant-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Décrivez brièvement votre restaurant..."
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SimpleImageUploader
            imageUrl={logoUrl}
            onImageChange={setLogoUrl}
            label="Logo du restaurant"
          />
          <SimpleImageUploader
            imageUrl={headerUrl}
            onImageChange={setHeaderUrl}
            label="Image d'en-tête"
          />
        </div>
        <div className="flex justify-end">
          <Button
            onClick={() =>
              updateWebsiteInfo({
                name,
                description,
                logo_url: logoUrl,
                header_image_url: headerUrl,
              })
            }
            disabled={isSaving || !hasChanged}
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Enregistrer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RestaurantNameTab;
