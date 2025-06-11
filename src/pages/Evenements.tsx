import React, { useState } from 'react';
import ModernSidebar from '../components/ModernSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, Users, MapPin, Plus, Search, Filter, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import EditEventModal from '@/components/events/EditEventModal';

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
      organisateur: "Marie Dupont"
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
      organisateur: "Chef Antoine"
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
      organisateur: "Société ABC"
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
      organisateur: "À définir"
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

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case 'confirmé':
        return <Badge className="bg-green-50 text-green-700 border-green-200">Confirmé</Badge>;
      case 'planifié':
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200">Planifié</Badge>;
      case 'annulé':
        return <Badge className="bg-red-50 text-red-700 border-red-200">Annulé</Badge>;
      default:
        return <Badge className="bg-gray-50 text-gray-700 border-gray-200">Inconnu</Badge>;
    }
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
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100/50 px-8 py-6 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-pink-800 bg-clip-text text-transparent">
                Événements
              </h1>
              <p className="text-sm text-gray-500 mt-1 font-medium">
                Gérez les événements spéciaux de votre restaurant
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-48"
                />
                <Button variant="outline" className="shadow-sm" onClick={handleSearch}>
                  <Search size={16} className="mr-2" />
                  Rechercher
                </Button>
              </div>
              <Button variant="outline" className="shadow-sm" onClick={handleFilter}>
                <Filter size={16} className="mr-2" />
                Filtres ({filterStatus})
              </Button>
              <Button 
                className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 shadow-lg shadow-purple-500/25"
                onClick={handleNewEvent}
              >
                <Plus size={16} className="mr-2" />
                Nouvel événement
              </Button>
            </div>
          </div>
        </header>

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
                  <div key={event.id} className="p-6 border border-gray-100 rounded-2xl bg-white/50 hover:bg-white/80 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold">
                          {event.nom.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{event.nom}</h3>
                          <p className="text-sm text-gray-500">{event.description}</p>
                        </div>
                      </div>
                      {getStatutBadge(event.statut)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar size={16} />
                        <span>{new Date(event.date).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock size={16} />
                        <span>{event.heure}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users size={16} />
                        <span>{event.participants} participants</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin size={16} />
                        <span>{event.lieu}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <span className="font-medium">Prix:</span>
                        <span>{formatCurrency(event.prix)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <span className="font-medium">Organisateur:</span>
                        <span>{event.organisateur}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditEvent(event)}
                      >
                        <Edit size={14} className="mr-1" />
                        Modifier
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteEvent(event.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={14} className="mr-1" />
                        Supprimer
                      </Button>
                    </div>
                  </div>
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
