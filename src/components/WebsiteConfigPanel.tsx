
import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface WebsiteConfigPanelProps {
  tab: string;
  onTabChange: (tab: string) => void;
  onPreview: () => void;
  onSave: () => void;
}

const WebsiteConfigPanel: React.FC<WebsiteConfigPanelProps> = ({
  tab,
  onTabChange,
  onPreview,
  onSave,
}) => {
  return (
    <Card className="w-full h-full flex flex-col shadow-md">
      <CardContent className="p-0 flex-1 flex flex-col">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b">
          <div className="font-bold text-xl">Configuration</div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onPreview}>
              Aperçu
            </Button>
            <Button size="sm" onClick={onSave}>
              Sauvegarder
            </Button>
          </div>
        </div>
        <Tabs value={tab} onValueChange={onTabChange} className="flex-1 flex flex-col">
          <TabsList className="rounded-none border-b flex justify-between px-6 py-2 bg-transparent mb-0">
            <TabsTrigger value="general" className="flex-1 text-center py-3">Général</TabsTrigger>
            <TabsTrigger value="design" className="flex-1 text-center py-3">Design</TabsTrigger>
            <TabsTrigger value="contact" className="flex-1 text-center py-3">Contact</TabsTrigger>
            <TabsTrigger value="options" className="flex-1 text-center py-3">Options</TabsTrigger>
          </TabsList>
          <div className="flex-1 overflow-auto px-6 py-4">
            <TabsContent value="general">
              <div className="space-y-4">
                <div>
                  <label className="block mb-1 font-medium">Nom du site</label>
                  <Input placeholder="Entrez le nom du site" />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Description</label>
                  <Input placeholder="Courte description" />
                </div>
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
      </CardContent>
    </Card>
  );
};

export default WebsiteConfigPanel;
