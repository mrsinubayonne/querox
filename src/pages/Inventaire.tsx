
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Plus, Upload, BarChart3 } from "lucide-react";

const Inventaire: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Inventaire</h1>
          <p className="text-gray-600">Gérez les stocks de votre restaurant</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-primary" />
              </div>
              <CardTitle>Inventaire vide</CardTitle>
              <CardDescription>
                Commencez par ajouter vos premiers produits
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button className="w-full mb-3">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un produit
              </Button>
              <Button variant="outline" className="w-full">
                <Upload className="w-4 h-4 mr-2" />
                Importer depuis Excel
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-secondary" />
              </div>
              <CardTitle>Suivi des stocks</CardTitle>
              <CardDescription>
                Surveillez vos niveaux de stock en temps réel
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <p>• Alertes de stock faible</p>
                <p>• Historique des mouvements</p>
                <p>• Rapports de consommation</p>
              </div>
              <Button variant="outline" className="w-full" disabled>
                Voir les rapports (aucun produit)
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Types de produits à gérer</CardTitle>
            <CardDescription>
              Organisez votre inventaire par catégories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <h3 className="font-semibold mb-2">Ingrédients</h3>
                <p className="text-sm text-gray-600">Viandes, légumes, épices, etc.</p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <h3 className="font-semibold mb-2">Boissons</h3>
                <p className="text-sm text-gray-600">Vins, bières, sodas, etc.</p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <h3 className="font-semibold mb-2">Matériel</h3>
                <p className="text-sm text-gray-600">Vaisselle, ustensiles, etc.</p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <h3 className="font-semibold mb-2">Produits d'entretien</h3>
                <p className="text-sm text-gray-600">Nettoyants, désinfectants, etc.</p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <h3 className="font-semibold mb-2">Emballages</h3>
                <p className="text-sm text-gray-600">Contenants, sacs, etc.</p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <h3 className="font-semibold mb-2">Autres</h3>
                <p className="text-sm text-gray-600">Produits divers</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Inventaire;
