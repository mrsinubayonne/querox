
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Users, DollarSign } from "lucide-react";

const Statistiques: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Statistiques</h1>
          <p className="text-gray-600">Analysez les performances de votre restaurant</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chiffre d'affaires</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0 €</div>
              <p className="text-xs text-muted-foreground">Aucune donnée disponible</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Commandes</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Aucune commande enregistrée</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Aucun client enregistré</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Croissance</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">Données insuffisantes</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-primary" />
            </div>
            <CardTitle>Aucune donnée statistique</CardTitle>
            <CardDescription>
              Commencez à utiliser votre restaurant pour voir vos statistiques
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="space-y-2 text-sm text-gray-600 mb-6">
              <p>Les statistiques apparaîtront automatiquement lorsque vous aurez :</p>
              <p>• Créé vos menus</p>
              <p>• Enregistré des commandes</p>
              <p>• Ajouté des clients</p>
              <p>• Configuré les réservations</p>
            </div>
            <Button variant="outline" disabled>
              Générer un rapport (aucune donnée)
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rapports disponibles</CardTitle>
            <CardDescription>
              Ces rapports seront disponibles une fois que vous aurez des données
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg opacity-50">
                <h3 className="font-semibold mb-2">Rapport de ventes</h3>
                <p className="text-sm text-gray-600">Analyse des ventes par période</p>
              </div>
              <div className="p-4 border rounded-lg opacity-50">
                <h3 className="font-semibold mb-2">Plats populaires</h3>
                <p className="text-sm text-gray-600">Classement des plats les plus vendus</p>
              </div>
              <div className="p-4 border rounded-lg opacity-50">
                <h3 className="font-semibold mb-2">Heures de pointe</h3>
                <p className="text-sm text-gray-600">Analyse des pics d'affluence</p>
              </div>
              <div className="p-4 border rounded-lg opacity-50">
                <h3 className="font-semibold mb-2">Fidélité client</h3>
                <p className="text-sm text-gray-600">Analyse du comportement client</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Statistiques;
