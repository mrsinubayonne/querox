import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Settings, 
  ArrowLeft, 
  User, 
  Globe, 
  Bell, 
  Shield, 
  Palette, 
  Database, 
  Camera,
  Info 
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Parametres = () => {
  const [siteTitle, setSiteTitle] = useState('Mon Site Web');
  const [siteDescription, setSiteDescription] = useState('Description de mon site web');
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);

  // Profile data
  const [firstName, setFirstName] = useState('Mohamed');
  const [lastName, setLastName] = useState('Sinulion');
  const [email, setEmail] = useState('mrsinulion@gmail.com');
  const [phone, setPhone] = useState('+221 77 123 45 67');
  const [position, setPosition] = useState('Administrateur');
  const [bio, setBio] = useState('Propriétaire et gérant principal du restaurant');

  // Restaurant data
  const [restaurantName, setRestaurantName] = useState('Mon Restaurant');
  const [currency, setCurrency] = useState('CFA');
  const [language, setLanguage] = useState('fr');
  const [timezone, setTimezone] = useState('Africa/Dakar');

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
      
      <main className="container py-8">
        <Tabs defaultValue="profile" className="max-w-4xl mx-auto">
          <TabsList className="mb-8 grid grid-cols-6 w-full">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Mon profil
            </TabsTrigger>
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Général
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Sécurité
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Apparence
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Données
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-6">
            <div className="space-y-6 p-6 bg-card rounded-lg border border-border">
              <h2 className="text-lg font-medium">Informations personnelles</h2>
              <p className="text-sm text-muted-foreground">Gérez vos informations de profil et de contact</p>
              
              <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-lg border">
                <div className="relative">
                  <Avatar className="h-16 w-16 bg-emerald-100">
                    <AvatarFallback className="bg-emerald-500 text-white text-lg font-semibold">
                      MS
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full"
                  >
                    <Camera className="h-3 w-3" />
                  </Button>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{firstName} {lastName}</h3>
                  <p className="text-sm text-emerald-600 font-medium">{position}</p>
                  <p className="text-sm text-muted-foreground">{email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="first-name" className="text-sm font-medium">
                    Prénom
                  </label>
                  <Input
                    id="first-name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="last-name" className="text-sm font-medium">
                    Nom
                  </label>
                  <Input
                    id="last-name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium">
                    Téléphone
                  </label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="position" className="text-sm font-medium">
                  Poste
                </label>
                <Input
                  id="position"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="bio" className="text-sm font-medium">
                  Biographie
                </label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  placeholder="Décrivez-vous en quelques mots..."
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-emerald-500" />
                  <div>
                    <CardTitle>Informations générales</CardTitle>
                    <CardDescription>Configurez les informations de base de votre restaurant</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="restaurant-name" className="text-sm font-medium">
                    Nom du restaurant
                  </label>
                  <Input
                    id="restaurant-name"
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="currency" className="text-sm font-medium">
                    Devise
                  </label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger id="currency">
                      <SelectValue placeholder="Sélectionner une devise" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CFA">Franc CFA (CFA)</SelectItem>
                      <SelectItem value="EUR">Euro (€)</SelectItem>
                      <SelectItem value="USD">Dollar américain ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="language" className="text-sm font-medium">
                    Langue
                  </label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger id="language">
                      <SelectValue placeholder="Sélectionner une langue" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="en">Anglais</SelectItem>
                      <SelectItem value="es">Espagnol</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="timezone" className="text-sm font-medium">
                    Fuseau horaire
                  </label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger id="timezone">
                      <SelectValue placeholder="Sélectionner un fuseau horaire" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Africa/Dakar">Dakar (GMT+0)</SelectItem>
                      <SelectItem value="Africa/Casablanca">Casablanca (GMT+1)</SelectItem>
                      <SelectItem value="Europe/Paris">Paris (GMT+2)</SelectItem>
                      <SelectItem value="America/New_York">New York (GMT-4)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
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

          <TabsContent value="security" className="space-y-6">
            <div className="space-y-4 p-6 bg-card rounded-lg border border-border">
              <h2 className="text-lg font-medium">Sécurité</h2>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Gérez vos paramètres de sécurité et de confidentialité.
                </p>
                <Button variant="outline">Changer le mot de passe</Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            <div className="space-y-4 p-6 bg-card rounded-lg border border-border">
              <h2 className="text-lg font-medium">Gestion des données</h2>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Exportez ou supprimez vos données personnelles.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline">Exporter les données</Button>
                  <Button variant="destructive">Supprimer le compte</Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Parametres;
