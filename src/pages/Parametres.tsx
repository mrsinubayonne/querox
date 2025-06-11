
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, ArrowLeft } from "lucide-react";

const Parametres = () => {
  const [siteTitle, setSiteTitle] = useState('Mon Site Web');
  const [siteDescription, setSiteDescription] = useState('Description de mon site web');
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/site-web">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-semibold flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Paramètres
            </h1>
          </div>
        </div>
      </header>
      
      <main className="container py-8">
        <Tabs defaultValue="general" className="max-w-3xl mx-auto">
          <TabsList className="mb-8">
            <TabsTrigger value="general">Général</TabsTrigger>
            <TabsTrigger value="appearance">Apparence</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="advanced">Avancé</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-6">
            <div className="space-y-4 p-6 bg-card rounded-lg border border-border">
              <h2 className="text-lg font-medium">Informations du site</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="site-title" className="text-sm font-medium">
                    Titre du site
                  </label>
                  <Input
                    id="site-title"
                    value={siteTitle}
                    onChange={(e) => setSiteTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="site-description" className="text-sm font-medium">
                    Description
                  </label>
                  <Textarea
                    id="site-description"
                    value={siteDescription}
                    onChange={(e) => setSiteDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="pt-2">
                  <Button>Sauvegarder</Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="appearance" className="space-y-6">
            <div className="space-y-4 p-6 bg-card rounded-lg border border-border">
              <h2 className="text-lg font-medium">Apparence</h2>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Mode sombre</span>
                <Switch
                  checked={darkMode}
                  onCheckedChange={setDarkMode}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-6">
            <div className="space-y-4 p-6 bg-card rounded-lg border border-border">
              <h2 className="text-lg font-medium">Préférences de notifications</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Notifications sur le site</p>
                    <p className="text-xs text-muted-foreground">Recevez des notifications dans l'application</p>
                  </div>
                  <Switch
                    checked={notifications}
                    onCheckedChange={setNotifications}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Mises à jour par email</p>
                    <p className="text-xs text-muted-foreground">Recevez des mises à jour par email</p>
                  </div>
                  <Switch
                    checked={emailUpdates}
                    onCheckedChange={setEmailUpdates}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="advanced" className="space-y-6">
            <div className="space-y-4 p-6 bg-card rounded-lg border border-border">
              <h2 className="text-lg font-medium">Paramètres avancés</h2>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Les paramètres avancés permettent une configuration plus détaillée de votre site web.
                </p>
                <Button variant="destructive">Réinitialiser tous les paramètres</Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Parametres;
