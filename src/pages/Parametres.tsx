
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  User, 
  Bell, 
  Shield,
  Users,
  Globe
} from "lucide-react";
import ProfileTab from "@/components/ProfileTab";
import { NotificationsTab } from "@/components/NotificationsTab";
import { SecurityTab } from "@/components/SecurityTab";
import { EquipeTab } from "@/components/EquipeTab";
import DomainTab from "@/components/DomainTab";

const Parametres = () => {
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container max-w-4xl py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/site-web">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-semibold">Paramètres</h1>
              <p className="text-sm text-muted-foreground">Configurez votre application selon vos préférences</p>
            </div>
          </div>
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            Sauvegarder
          </Button>
        </div>
      </header>
      
      <main className="container max-w-4xl py-8">
        <Tabs defaultValue="profile" className="max-w-3xl mx-auto">
          <TabsList className="mb-8 grid grid-cols-5 w-full mx-auto">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Mon profil
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Sécurité
            </TabsTrigger>
            <TabsTrigger value="equipe" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Équipe
            </TabsTrigger>
            <TabsTrigger value="domain" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Domaine
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-6">
            <ProfileTab />
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-6">
            <NotificationsTab
              notifications={notifications}
              setNotifications={setNotifications}
              emailUpdates={emailUpdates}
              setEmailUpdates={setEmailUpdates}
            />
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <SecurityTab />
          </TabsContent>

          <TabsContent value="equipe" className="space-y-6">
            <EquipeTab />
          </TabsContent>

          <TabsContent value="domain" className="space-y-6">
            <DomainTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Parametres;
