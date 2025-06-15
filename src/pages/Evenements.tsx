
import React, { useState } from 'react';
import ModernSidebar from '@/components/ModernSidebar';
import EmptyState from '@/components/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, MapPin, Users, Clock, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const initialMockEvents = [
  {
    id: 1,
    title: "Soirée Jazz",
    date: "2024-06-20",
    time: "20:00",
    location: "Salle principale",
    capacity: 50,
    registered: 35,
    status: "Confirmé",
    description: "Soirée jazz avec le trio local Les Notes Bleues"
  },
  {
    id: 2,
    title: "Dîner dégustation",
    date: "2024-06-25",
    time: "19:30",
    location: "Restaurant",
    capacity: 24,
    registered: 18,
    status: "En cours",
    description: "Menu dégustation 5 services avec accords mets-vins"
  },
  {
    id: 3,
    title: "Brunch du dimanche",
    date: "2024-06-30",
    time: "11:00",
    location: "Terrasse",
    capacity: 40,
    registered: 12,
    status: "Ouvert",
    description: "Brunch buffet avec vue sur le jardin"
  }
];

const Evenements: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { toast } = useToast();

  const [events, setEvents] = useState(initialMockEvents);

  const handleAddEvent = () => {
    toast({
      title: "Nouvel événement",
      description: "Fonctionnalité bientôt disponible",
    });
  };

  const handleDeleteEvent = (id: number) => {
    setEvents(prev => prev.filter(event => event.id !== id));
    toast({
      title: "Événement supprimé",
      description: "L'événement a été retiré de la liste.",
      variant: "default",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmé":
        return "bg-green-100 text-green-800";
      case "En cours":
        return "bg-blue-100 text-blue-800";
      case "Ouvert":
        return "bg-yellow-100 text-yellow-800";
      case "Complet":
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Événements</h1>
              <p className="text-gray-600">Organisez et gérez vos événements spéciaux</p>
            </div>
            <Button onClick={handleAddEvent} className="flex items-center gap-2">
              <Plus size={16} />
              Nouvel événement
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
              Voici à quoi ressemblera votre gestion d'événements avec de vraies données.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {events.map((event) => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{event.title}</CardTitle>
                    <Badge className={getStatusColor(event.status)}>
                      {event.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{event.description}</p>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <CalendarDays size={16} className="mr-2" />
                      {new Date(event.date).toLocaleDateString('fr-FR')}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock size={16} className="mr-2" />
                      {event.time}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin size={16} className="mr-2" />
                      {event.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users size={16} className="mr-2" />
                      {event.registered}/{event.capacity} participants
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(event.registered / event.capacity) * 100}%` }}
                    ></div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Modifier
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      Participants
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-red-500 border-red-200 hover:bg-red-50"
                      onClick={() => handleDeleteEvent(event.id)}
                    >
                      <Trash2 size={14} className="mr-1" />
                      Supprimer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {events.length === 0 && (
              <EmptyState
                icon={CalendarDays}
                title="Aucun événement"
                description="Il n'y a aucun événement à afficher pour le moment."
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Evenements;
