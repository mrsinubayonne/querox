
import React, { useState, useEffect } from "react";
import { useRestaurantSettings } from "@/hooks/useRestaurantSettings";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const RestaurantNameTab = () => {
  const { website, loading, isSaving, updateWebsiteName } = useRestaurantSettings();
  const [name, setName] = useState('');
  useEffect(() => {
    if (website?.name) setName(website.name);
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations générales du restaurant</CardTitle>
        <CardDescription>Définissez le nom de votre restaurant.</CardDescription>
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
        <div className="flex justify-end">
          <Button
            onClick={() => updateWebsiteName(name)}
            disabled={isSaving || name === website.name}
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
