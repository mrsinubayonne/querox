
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users, Settings } from "lucide-react";

const Reservations: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Réservations</h1>
          <p className="text-gray-600">Gérez les réservations de votre restaurant</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-primary" />
              </div>
              <CardTitle>Aucune réservation</CardTitle>
              <CardDescription>
                Configurez d'abord votre système de réservation
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button className="w-full mb-3">
                <Settings className="w-4 h-4 mr-2" />
                Configurer les réservations
              </Button>
              <Button variant="outline" className="w-full">
                <Clock className="w-4 h-4 mr-2" />
                Définir les horaires
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-secondary" />
              </div>
              <CardTitle>Capacité du restaurant</CardTitle>
              <CardDescription>
                Définissez le nombre de tables et de couverts
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <p>• Nombre de tables non défini</p>
                <p>• Capacité totale non définie</p>
                <p>• Horaires d'ouverture à configurer</p>
              </div>
              <Button variant="outline" className="w-full">
                Configurer la capacité
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Configuration requise</CardTitle>
            <CardDescription>
              Configurez ces éléments pour activer les réservations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-sm">Horaires d'ouverture</span>
                </div>
                <Button variant="outline" size="sm">Configurer</Button>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-sm">Nombre de tables</span>
                </div>
                <Button variant="outline" size="sm">Configurer</Button>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-sm">Durée des repas</span>
                </div>
                <Button variant="outline" size="sm">Configurer</Button>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-sm">Règles de réservation</span>
                </div>
                <Button variant="outline" size="sm">Configurer</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reservations;
