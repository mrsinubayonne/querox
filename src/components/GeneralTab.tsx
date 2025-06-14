
import React from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";

interface GeneralTabProps {
  restaurantName: string;
  setRestaurantName: (value: string) => void;
  currency: string;
  setCurrency: (value: string) => void;
  language: string;
  setLanguage: (value: string) => void;
  timezone: string;
  setTimezone: (value: string) => void;
}

export const GeneralTab: React.FC<GeneralTabProps> = ({
  restaurantName,
  setRestaurantName,
  currency,
  setCurrency,
  language,
  setLanguage,
  timezone,
  setTimezone
}) => {
  return (
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
  );
};
