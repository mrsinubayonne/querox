
import React, { useState } from 'react';
import ModernSidebar from '@/components/ModernSidebar';
import EmptyState from '@/components/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Clock, Users, Phone, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Reservations: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { toast } = useToast();

  // Données de démonstration
  const mockReservations = [
    {
      id: 1,
      customerName: "Marie Dupont",
      date: "2024-06-15",
      time: "19:30",
      guests: 4,
      phone: "06 12 34 56 78",
      status: "Confirmée",
      notes: "Table près de la fenêtre si possible"
    },
    {
      id: 2,
      customerName: "Pierre Martin",
      date: "2024-06-15",
      time: "20:00",
      guests: 2,
      phone: "06 98 76 54 32",
      status: "En attente",
      notes: ""
    },
    {
      id: 3,
      customerName: "Sophie Leblanc",
      date: "2024-06-16",
      time: "12:30",
      guests: 6,
      phone: "06 11 22 33 44",
      status: "Confirmée",
      notes: "Anniversaire - gâteau prévu"
    }
  ];

  const handleAddReservation = () => {
    toast({
      title: "Nouvelle réservation",
      description: "Fonctionnalité bientôt disponible",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmée":
        return "bg-green-100 text-green-800";
      case "En attente":
        return "bg-yellow-100 text-yellow-800";
      case "Annulée":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Réservations</h1>
              <p className="text-gray-600">Gérez les réservations de votre restaurant</p>
            </div>
            <Button onClick={handleAddReservation} className="flex items-center gap-2">
              <Plus size={16} />
              Nouvelle réservation
            </Button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-blue-800">
                Interface de démonstration - Données d'exemple
              </span>
            </div>
            <p className="text-sm text-blue-600 mt-1">
              Voici à quoi ressemblera votre système de réservations avec de vraies données.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {mockReservations.map((reservation) => (
              <Card key={reservation.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{reservation.customerName}</CardTitle>
                    <Badge className={getStatusColor(reservation.status)}>
                      {reservation.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <CalendarDays size={16} className="mr-2" />
                      {new Date(reservation.date).toLocaleDateString('fr-FR')}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock size={16} className="mr-2" />
                      {reservation.time}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users size={16} className="mr-2" />
                      {reservation.guests} personnes
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone size={16} className="mr-2" />
                      {reservation.phone}
                    </div>
                    {reservation.notes && (
                      <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        <strong>Notes:</strong> {reservation.notes}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1">
                      Modifier
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      Contacter
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reservations;
