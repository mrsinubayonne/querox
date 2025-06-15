
import React, { useState } from 'react';
import ModernSidebar from '@/components/ModernSidebar';
import EmptyState from '@/components/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Clock, Users, Phone, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useReservations } from '@/hooks/useReservations';

const Reservations: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { toast } = useToast();
  const { reservations, loading } = useReservations();

  const handleAddReservation = () => {
    toast({
      title: "Nouvelle réservation",
      description: "Fonctionnalité bientôt disponible",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Confirmée";
      case "pending":
        return "En attente";
      case "cancelled":
        return "Annulée";
      case "completed":
        return "Terminée";
      default:
        return status;
    }
  };

  const displayReservations = reservations && reservations.length > 0 ? reservations : mockReservations;
  const isEmptyState = !reservations || reservations.length === 0;

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-sm text-gray-600">Chargement des réservations...</p>
          </div>
        </div>
      </div>
    );
  }

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

          {isEmptyState && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-blue-800">
                  Interface de démonstration - Aucune réservation trouvée
                </span>
              </div>
              <p className="text-sm text-blue-600 mt-1">
                Voici à quoi ressemblera votre système de réservations avec de vraies données.
              </p>
            </div>
          )}

          {displayReservations.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {displayReservations.map((reservation) => (
                <Card key={reservation.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{reservation.customer_name}</CardTitle>
                      <Badge className={getStatusColor(reservation.status)}>
                        {getStatusLabel(reservation.status)}
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
                        {reservation.party_size} personnes
                      </div>
                      {reservation.customer_phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone size={16} className="mr-2" />
                          {reservation.customer_phone}
                        </div>
                      )}
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
          ) : (
            <EmptyState
              icon={CalendarDays}
              title="Aucune réservation"
              description="Commencez par ajouter votre première réservation"
              actionLabel="Nouvelle réservation"
              onAction={handleAddReservation}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Reservations;
