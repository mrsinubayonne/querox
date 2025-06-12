
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, MenuBook, Upload, Eye } from "lucide-react";

const Menus: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Menus</h1>
          <p className="text-gray-600">Gérez les menus de votre restaurant</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MenuBook className="w-8 h-8 text-primary" />
              </div>
              <CardTitle>Aucun menu créé</CardTitle>
              <CardDescription>
                Commencez par créer votre premier menu
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button className="w-full mb-3">
                <Plus className="w-4 h-4 mr-2" />
                Créer un menu
              </Button>
              <Button variant="outline" className="w-full">
                <Upload className="w-4 h-4 mr-2" />
                Importer un menu
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="w-8 h-8 text-secondary" />
              </div>
              <CardTitle>Aperçu</CardTitle>
              <CardDescription>
                Visualisez vos menus comme vos clients les verront
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <p>• Format QR Code</p>
                <p>• Version web</p>
                <p>• Version imprimable</p>
              </div>
              <Button variant="outline" className="w-full" disabled>
                Aperçu (aucun menu)
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Guide de démarrage</CardTitle>
            <CardDescription>
              Suivez ces étapes pour créer votre premier menu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-semibold">1</div>
                <div>
                  <h3 className="font-semibold">Créer une catégorie</h3>
                  <p className="text-sm text-gray-600">Organisez vos plats par catégories (Entrées, Plats, Desserts...)</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-semibold">2</div>
                <div>
                  <h3 className="font-semibold">Ajouter des plats</h3>
                  <p className="text-sm text-gray-600">Ajoutez vos plats avec descriptions, prix et photos</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-semibold">3</div>
                <div>
                  <h3 className="font-semibold">Générer le QR Code</h3>
                  <p className="text-sm text-gray-600">Créez des QR codes pour vos tables</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Menus;
