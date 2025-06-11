
import React, { useState } from 'react';
import ModernSidebar from '../components/ModernSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, Phone, Mail, Plus, Search, Filter } from 'lucide-react';

const Reservations: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const reservations = [
    {
      id: 1,
      nom: "Martin Dubois",
      email: "martin.dubois@email.com",
      telephone: "06 12 34 56 78",
      date: "2024-06-15",
      heure: "19:30",
      personnes: 4,
      statut: "confirmée",
      table: "Table 12",
      notes: "Anniversaire de mariage"
    },
    {
      id: 2,
      nom: "Sophie Laurent",
      email: "sophie.laurent@email.com",
      telephone: "06 98 76 54 32",
      date: "2024-06-15",
      heure: "20:00",
      personnes: 2,
      statut: "en_attente",
      table: "Table 5",
      notes: "Allergie aux fruits de mer"
    },
    {
      id: 3,
      nom: "Pierre et Marie Garcia",
      email: "garcia.family@email.com",
      telephone: "06 55 44 33 22",
      date: "2024-06-16",
      heure: "12:30",
      personnes: 6,
      statut: "confirmée",
      table: "Table 20",
      notes: "Repas de famille avec enfants"
    }
  ];

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case 'confirmée':
        return <Badge className="bg-green-50 text-green-700 border-green-200">Confirmée</Badge>;
      case 'en_attente':
        return <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">En attente</Badge>;
      case 'annulée':
        return <Badge className="bg-red-50 text-red-700 border-red-200">Annulée</Badge>;
      default:
        return <Badge className="bg-gray-50 text-gray-700 border-gray-200">Inconnue</Badge>;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100/50 px-8 py-6 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-indigo-800 bg-clip-text text-transparent">
                Réservations
              </h1>
              <p className="text-sm text-gray-500 mt-1 font-medium">
                Gérez les réservations de votre restaurant
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
              <Button className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:via-indigo-700 hover:to-blue-700 shadow-lg shadow-purple-500/25">
                <Plus size={16} className="mr-2" />
                Nouvelle réservation
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
                    <p className="text-sm text-gray-500">Aujourd'hui</p>
                    <p className="text-2xl font-bold text-gray-900">12</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-sm bg-white/60 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
                    <Clock size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Cette semaine</p>
                    <p className="text-2xl font-bold text-gray-900">47</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-sm bg-white/60 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg">
                    <Users size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Couverts ce mois</p>
                    <p className="text-2xl font-bold text-gray-900">284</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-sm bg-white/60 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Taux d'occupation</p>
                    <p className="text-2xl font-bold text-gray-900">78%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Liste des réservations */}
          <Card className="border-0 shadow-sm bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">
                Réservations récentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reservations.map((reservation) => (
                  <div key={reservation.id} className="p-6 border border-gray-100 rounded-2xl bg-white/50 hover:bg-white/80 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold">
                          {reservation.nom.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{reservation.nom}</h3>
                          <p className="text-sm text-gray-500">{reservation.table}</p>
                        </div>
                      </div>
                      {getStatutBadge(reservation.statut)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar size={16} />
                        <span>{new Date(reservation.date).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock size={16} />
                        <span>{reservation.heure}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users size={16} />
                        <span>{reservation.personnes} personnes</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone size={16} />
                        <span>{reservation.telephone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail size={16} />
                        <span>{reservation.email}</span>
                      </div>
                    </div>
                    
                    {reservation.notes && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Notes :</strong> {reservation.notes}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm">
                        Modifier
                      </Button>
                      <Button variant="outline" size="sm">
                        Contacter
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default Reservations;
