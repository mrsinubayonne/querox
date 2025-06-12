
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, Settings, Eye, Palette } from "lucide-react";

const SiteWeb: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Site Web</h1>
          <p className="text-gray-600">Créez et gérez le site web de votre restaurant</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-primary" />
              </div>
              <CardTitle>Aucun site web configuré</CardTitle>
              <CardDescription>
                Créez un site web professionnel pour votre restaurant en quelques minutes
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button className="w-full mb-3">
                <Settings className="w-4 h-4 mr-2" />
                Créer mon site web
              </Button>
              <Button variant="outline" className="w-full">
                <Eye className="w-4 h-4 mr-2" />
                Voir les modèles
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Palette className="w-8 h-8 text-secondary" />
              </div>
              <CardTitle>Personnalisation</CardTitle>
              <CardDescription>
                Personnalisez l'apparence et le contenu de votre site
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <p>• Ajoutez votre logo et vos couleurs</p>
                <p>• Configurez vos informations</p>
                <p>• Ajoutez vos menus et photos</p>
              </div>
              <Button variant="outline" className="w-full" disabled>
                Personnaliser (bientôt disponible)
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Fonctionnalités disponibles</CardTitle>
            <CardDescription>
              Votre site web inclura toutes ces fonctionnalités
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Affichage des menus</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Réservations en ligne</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Galerie photos</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Informations de contact</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Responsive mobile</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">SEO optimisé</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SiteWeb;
