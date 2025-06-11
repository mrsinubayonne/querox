
import React, { useState } from 'react';
import ModernSidebar from '../components/ModernSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Clock, Star, Plus, Search, Filter } from 'lucide-react';

const Evenements: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const evenements = [
    {
      id: 1,
      titre: "Soirée Jazz & Dîner",
      description: "Une soirée exceptionnelle avec le quartet de jazz local accompagnée d'un menu dégustation spécialement conçu pour l'occasion.",
      date: "2024-06-20",
      heureDebut: "19:00",
      heureFin: "23:00",
      lieu: "Salle principale",
      participants: 45,
      participantsMax: 50,
      prix: 85,
      statut: "ouvert",
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=200&fit=crop",
      organisateur: "Chef Antoine",
      tags: ["musique", "gastronomie", "soirée"]
    },
    {
      id: 2,
      titre: "Atelier Cuisine Italienne",
      description: "Apprenez à préparer des pâtes fraîches et des sauces authentiques avec notre chef italien invité.",
      date: "2024-06-25",
      heureDebut: "14:00",
      heureFin: "17:00",
      lieu: "Cuisine pédagogique",
      participants: 12,
      participantsMax: 15,
      prix: 65,
      statut: "ouvert",
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=200&fit=crop",
      organisateur: "Chef Marco",
      tags: ["cours", "cuisine", "italien"]
    },
    {
      id: 3,
      titre: "Dégustation Vins & Fromages",
      description: "Découverte de vins régionaux accompagnés d'une sélection de fromages artisanaux.",
      date: "2024-07-05",
      heureDebut: "18:30",
      heureFin: "21:00",
      lieu: "Cave à vins",
      participants: 20,
      participantsMax: 20,
      prix: 45,
      statut: "complet",
      image: "https://images.unsplash.com/photo-1506377872008-6645d6fine33?w=400&h=200&fit=crop",
      organisateur: "Sommelier Pierre",
      tags: ["dégustation", "vins", "fromages"]
    }
  ];

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case 'ouvert':
        return <Badge className="bg-green-50 text-green-700 border-green-200">Places disponibles</Badge>;
      case 'complet':
        return <Badge className="bg-red-50 text-red-700 border-red-200">Complet</Badge>;
      case 'annule':
        return <Badge className="bg-gray-50 text-gray-700 border-gray-200">Annulé</Badge>;
      default:
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200">Programmé</Badge>;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-orange-50/30 to-red-50/50">
      <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100/50 px-8 py-6 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-orange-800 to-red-800 bg-clip-text text-transparent">
                Événements
              </h1>
              <p className="text-sm text-gray-500 mt-1 font-medium">
                Organisez et gérez vos événements spéciaux
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="outline" className="shadow-sm">
                <Search size={16} className="mr-2" />
                Rechercher
              </Button>
              <Button variant="outline" className="shadow-sm">
                <Filter size={16} className="mr-2" />
                Filtres
              </Button>
              <Button className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 hover:from-orange-700 hover:via-red-700 hover:to-pink-700 shadow-lg shadow-orange-500/25">
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
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Ce mois</p>
                    <p className="text-2xl font-bold text-gray-900">8</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-sm bg-white/60 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg">
                    <Users size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Participants</p>
                    <p className="text-2xl font-bold text-gray-900">127</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-sm bg-white/60 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-pink-500 to-pink-600 text-white shadow-lg">
                    <Star size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Note moyenne</p>
                    <p className="text-2xl font-bold text-gray-900">4.8</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-sm bg-white/60 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">À venir</p>
                    <p className="text-2xl font-bold text-gray-900">5</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Liste des événements */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {evenements.map((evenement) => (
              <Card key={evenement.id} className="border-0 shadow-sm bg-white/60 backdrop-blur-sm overflow-hidden">
                <div className="relative">
                  <img 
                    src={evenement.image} 
                    alt={evenement.titre}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    {getStatutBadge(evenement.statut)}
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <span className="bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {evenement.prix}€
                    </span>
                  </div>
                </div>
                
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold text-gray-900">
                    {evenement.titre}
                  </CardTitle>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {evenement.description}
                  </p>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar size={16} />
                      <span>{new Date(evenement.date).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock size={16} />
                      <span>{evenement.heureDebut} - {evenement.heureFin}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin size={16} />
                      <span>{evenement.lieu}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users size={16} />
                      <span>{evenement.participants}/{evenement.participantsMax} participants</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {evenement.tags.map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-gray-500">
                      Organisé par <span className="font-medium">{evenement.organisateur}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 ml-4">
                      <div 
                        className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full"
                        style={{ width: `${(evenement.participants / evenement.participantsMax) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Modifier
                    </Button>
                    <Button size="sm" className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                      Voir détails
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Evenements;
