
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  User, 
  Bell, 
  Shield,
  Globe,
  Database,
  FileText,
  UserCog,
  Store
} from "lucide-react";
import ProfileTab from "@/components/ProfileTab";
import { NotificationsTab } from "@/components/NotificationsTab";
import { SecurityTab } from "@/components/SecurityTab";
import DomainTab from "@/components/DomainTab";
import { DataTab } from "@/components/DataTab";
import { InvoiceSettingsTab } from "@/components/InvoiceSettingsTab";
import { UserProfilesTab } from "@/components/UserProfilesTab";
import { OutletSettingsTab } from "@/components/OutletSettingsTab";

const Parametres = () => {
  const [searchParams] = useSearchParams();
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container max-w-4xl py-4 flex items-center gap-2">
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
      </header>
      
      <main className="container max-w-4xl py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-3xl mx-auto">
          <TabsList className="mb-8 grid grid-cols-8 w-full mx-auto">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profil
            </TabsTrigger>
            <TabsTrigger value="outlet" className="flex items-center gap-2">
              <Store className="h-4 w-4" />
              PDV
            </TabsTrigger>
            <TabsTrigger value="invoices" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Factures
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Sécurité
            </TabsTrigger>
            <TabsTrigger value="profiles" className="flex items-center gap-2">
              <UserCog className="h-4 w-4" />
              Profils
            </TabsTrigger>
            <TabsTrigger value="domain" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Domaine
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Données
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <ProfileTab />
          </TabsContent>

          <TabsContent value="outlet" className="space-y-6">
            <OutletSettingsTab />
          </TabsContent>

          <TabsContent value="invoices" className="space-y-6">
            <InvoiceSettingsTab />
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

          <TabsContent value="profiles" className="space-y-6">
            <UserProfilesTab />
          </TabsContent>

          <TabsContent value="domain" className="space-y-6">
            <DomainTab />
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            <DataTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Parametres;
