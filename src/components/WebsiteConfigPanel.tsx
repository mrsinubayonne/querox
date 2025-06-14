
import React, { useState, useEffect, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Website } from "@/hooks/useWebsites";
import { Textarea } from "./ui/textarea";
import LogoUpload from "./LogoUpload";
import SimpleImageUploader from "./SimpleImageUploader";
import { debounce } from "lodash";

interface WebsiteConfigPanelProps {
  tab: string;
  onTabChange: (tab: string) => void;
  website: Website | null;
  onUpdate: (id: string, updates: Partial<Website>) => Promise<any>;
}

const WebsiteConfigPanel: React.FC<WebsiteConfigPanelProps> = ({
  tab,
  onTabChange,
  website,
  onUpdate,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);
  const [dishImageUrl, setDishImageUrl] = useState<string | undefined>(undefined);
  const [headerImageUrl, setHeaderImageUrl] = useState<string | undefined>(undefined);

  const debouncedUpdate = useCallback(debounce((id, updates) => onUpdate(id, updates), 500), [onUpdate]);

  useEffect(() => {
    if (website) {
      setName(website.name || "");
      setDescription(website.description || "");
      setLogoUrl(website.logo_url);
      // Note: dish and header images are not in the database schema yet.
      // This is for UI demonstration.
    }
  }, [website]);

  const handleUpdate = (updates: Partial<Website>) => {
    if (website) {
      debouncedUpdate(website.id, updates);
    }
  };
  
  const handleLogoChange = (newLogoUrl: string | undefined) => {
    setLogoUrl(newLogoUrl);
    if (website) {
      onUpdate(website.id, { logo_url: newLogoUrl });
    }
  };

  return (
    <Tabs value={tab} onValueChange={onTabChange} className="w-full">
      <TabsList>
        <TabsTrigger value="general">Général</TabsTrigger>
        <TabsTrigger value="design">Conception</TabsTrigger>
        <TabsTrigger value="contact">Contact</TabsTrigger>
        <TabsTrigger value="options">Options</TabsTrigger>
      </TabsList>
      <div className="pt-6">
        <TabsContent value="general">
          <div className="space-y-6">
            <div>
              <label className="block mb-2 font-medium text-sm">Nom du restaurant</label>
              <Input
                placeholder="Mon Restaurant"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  handleUpdate({ name: e.target.value });
                }}
              />
            </div>
            <div>
              <label className="block mb-2 font-medium text-sm">Description</label>
              <Textarea
                placeholder="Découvrez notre cuisine authentique et savoureuse dans un cadre chaleureux."
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value)
                  handleUpdate({ description: e.target.value });
                }}
                className="h-24"
              />
            </div>
            <LogoUpload currentLogo={logoUrl} onLogoChange={handleLogoChange} />
            <SimpleImageUploader label="Image du plat" imageUrl={dishImageUrl} onImageChange={setDishImageUrl} />
            <SimpleImageUploader label="Image d'en-tête" imageUrl={headerImageUrl} onImageChange={setHeaderImageUrl} />
          </div>
        </TabsContent>
        <TabsContent value="design">
          <div className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Couleur principale</label>
              <Input type="color" defaultValue="#3B82F6" className="w-20 h-10 p-1" />
            </div>
            <div>
              <label className="block mb-1 font-medium">Couleur secondaire</label>
              <Input type="color" defaultValue="#EF4444" className="w-20 h-10 p-1" />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="contact">
          <div className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Adresse</label>
              <Input placeholder="Adresse du restaurant" />
            </div>
            <div>
              <label className="block mb-1 font-medium">Téléphone</label>
              <Input placeholder="Numéro de téléphone" />
            </div>
            <div>
              <label className="block mb-1 font-medium">Email</label>
              <Input placeholder="Adresse e-mail" />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="options">
          <div className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Activation du site</label>
              <Input type="checkbox" /> <span className="ml-2">Activer/Désactiver</span>
            </div>
            <div>
              <label className="block mb-1 font-medium">Domaine personnalisé</label>
              <Input placeholder="www.monsite.com" />
            </div>
          </div>
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default WebsiteConfigPanel;
