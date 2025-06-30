
import React, { useState, useEffect } from 'react';
import { useMenuSettings } from '@/hooks/useMenuSettings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LogoUpload from '@/components/LogoUpload';
import SimpleImageUploader from '@/components/SimpleImageUploader';
import { Loader2 } from 'lucide-react';

const GeneralSettingsTab = () => {
  const { menu, loading, isSaving, updateMenuSettings } = useMenuSettings();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);
  const [headerImageUrl, setHeaderImageUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (menu) {
      setName(menu.name);
      setDescription(menu.description || '');
      setLogoUrl(menu.logo_url || undefined);
      setHeaderImageUrl(menu.header_image_url || undefined);
    }
  }, [menu]);

  const handleSave = () => {
    console.log('Saving menu settings with:', {
      name,
      description,
      logo_url: logoUrl,
      header_image_url: headerImageUrl
    });
    updateMenuSettings({
      name,
      description,
      logo_url: logoUrl,
      header_image_url: headerImageUrl,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!menu) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-600">Aucun menu trouvé. Créez-en un pour gérer ses paramètres.</p>
      </div>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Paramètres Généraux du Menu</CardTitle>
        <CardDescription>Gérez les informations de base de votre menu.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="space-y-2">
          <label htmlFor="restaurant-name" className="text-sm font-medium">Nom du restaurant</label>
          <Input id="restaurant-name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="menu-description" className="text-sm font-medium">Description</label>
          <Textarea id="menu-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Décrivez votre menu..." />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <LogoUpload
                currentLogo={logoUrl}
                onLogoChange={(url) => {
                  console.log('Logo changed to:', url);
                  setLogoUrl(url);
                }}
            />
            <SimpleImageUploader
                imageUrl={headerImageUrl}
                onImageChange={(url) => {
                  console.log('Header image changed to:', url);
                  setHeaderImageUrl(url);
                }}
                label="Image d'en-tête"
            />
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Enregistrer les modifications
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GeneralSettingsTab;
