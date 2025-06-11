import React, { useState } from 'react';
import ModernSidebar from '../components/ModernSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, Users, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import EditEventModal from '@/components/events/EditEventModal';
import EventsHeader from '@/components/events/EventsHeader';
import EventCard from '@/components/events/EventCard';

const Evenements: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("tous");
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const { toast } = useToast();
  
  const [events, setEvents] = useState([
    {
      id: 1,
      nom: "Soirée Jazz",
      description: "Concert de jazz avec menu spécial",
      date: "2024-06-20",
      heure: "20:00",
      participants: 50,
      lieu: "Salle principale",
      statut: "confirmé",
      prix: 25000,
      organisateur: "Marie Dupont",
      image: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81"
    },
    {
      id: 2,
      nom: "Dégustation vins",
      description: "Dégustation de vins avec accord mets",
      date: "2024-06-25",
      heure: "19:30",
      participants: 30,
      lieu: "Terrasse",
      statut: "planifié",
      prix: 15000,
      organisateur: "Chef Antoine",
      image: "https://images.unsplash.com/photo-1472396961693-142e6e269027"
    },
    {
      id: 3,
      nom: "Anniversaire entreprise",
      description: "Fête d'anniversaire de la société ABC",
      date: "2024-06-18",
      heure: "18:00",
      participants: 80,
      lieu: "Salle privée",
      statut: "confirmé",
      prix: 45000,
      organisateur: "Société ABC",
      image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c"
    }
  ]);

  const handleSearch = () => {
    toast({
      title: "Recherche lancée",
      description: `Recherche pour: ${searchTerm}`,
    });
  };

  const handleFilter = () => {
    const statuses = ["tous", "confirmé", "planifié", "annulé"];
    const currentIndex = statuses.indexOf(filterStatus);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
    setFilterStatus(nextStatus);
    toast({
      title: "Filtre appliqué",
      description: `Affichage: ${nextStatus}`,
    });
  };

  const handleNewEvent = () => {
    const newEvent = {
      id: Date.now(),
      nom: "Nouvel événement",
      description: "Description à compléter",
      date: new Date().toISOString().split('T')[0],
      heure: "19:00",
      participants: 0,
      lieu: "À définir",
      statut: "planifié",
      prix: 0,
      organisateur: "À définir",
      image: "/lovable-uploads/eedf6dca-ced1-4275-a5ca-db24eefce183.png"
    };
    setEvents(prev => [newEvent, ...prev]);
    toast({
      title: "Événement créé",
      description: "Nouvel événement ajouté avec succès",
    });
  };

  const handleEditEvent = (event: any) => {
    setSelectedEvent(event);
    setShowEditModal(true);
  };

  const handleUpdateEvent = (updatedEvent: any) => {
    setEvents(prev => 
      prev.map(e => e.id === updatedEvent.id ? updatedEvent : e)
    );
    toast({
      title: "Événement modifié",
      description: `${updatedEvent.nom} a été mis à jour`,
    });
  };

  const handleDeleteEvent = (id: number) => {
    const event = events.find(e => e.id === id);
    setEvents(prev => prev.filter(e => e.id !== id));
    toast({
      title: "Événement supprimé",
      description: `${event?.nom} a été supprimé`,
    });
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "tous" || event.statut === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' CFA';
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/50">
      <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div className="flex-1 overflow-auto">
        <EventsHeader
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterStatus={filterStatus}
          onSearch={handleSearch}
          onFilter={handleFilter}
          onNewEvent={handleNewEvent}
        />

        <main className="p-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="border-0 shadow-sm bg-white/60 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Cette semaine</p>
                    <p className="text-2xl font-bold text-gray-900">{filteredEvents.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-sm bg-white/60 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
                    <Users size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Participants total</p>
                    <p className="text-2xl font-bold text-gray-900">{filteredEvents.reduce((sum, e) => sum + e.participants, 0)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-sm bg-white/60 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Revenus estimés</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(filteredEvents.reduce((sum, e) => sum + e.prix, 0))}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-sm bg-white/60 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg">
                    <Clock size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Confirmés</p>
                    <p className="text-2xl font-bold text-gray-900">{filteredEvents.filter(e => e.statut === 'confirmé').length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Liste des événements */}
          <Card className="border-0 shadow-sm bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">
                Événements ({filteredEvents.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onEdit={handleEditEvent}
                    onDelete={handleDeleteEvent}
                    formatCurrency={formatCurrency}
                  />
                ))}
              </div>

              {filteredEvents.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun événement trouvé</p>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      <EditEventModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleUpdateEvent}
        event={selectedEvent}
      />
    </div>
  );
};

export default Evenements;
