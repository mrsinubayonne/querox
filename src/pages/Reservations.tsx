import React, { useState } from 'react';
import ModernSidebar from '@/components/ModernSidebar';
import SubscriptionGuard from '@/components/SubscriptionGuard';
import SubscriptionPopup from '@/components/SubscriptionPopup';
import { Calendar, Clock, Users, Phone, Mail, User, ChevronRight, Plus, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

const Reservations: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showNewReservation, setShowNewReservation] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock reservations data
  const [reservations] = useState([
    {
      id: 1,
      customerName: 'Jean Dupont',
      email: 'jean.dupont@example.com',
      phone: '+33 6 12 34 56 78',
      date: '2025-10-15',
      time: '19:30',
      guests: 4,
      status: 'confirmed',
      notes: 'Anniversaire - Table près de la fenêtre souhaitée'
    },
    {
      id: 2,
      customerName: 'Marie Martin',
      email: 'marie.martin@example.com',
      phone: '+33 6 98 76 54 32',
      date: '2025-10-15',
      time: '20:00',
      guests: 2,
      status: 'pending',
      notes: ''
    },
    {
      id: 3,
      customerName: 'Pierre Bernard',
      email: 'pierre.bernard@example.com',
      phone: '+33 6 45 67 89 01',
      date: '2025-10-16',
      time: '19:00',
      guests: 6,
      status: 'confirmed',
      notes: 'Menu végétarien'
    }
  ]);

  const handleNewReservation = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Réservation créée",
      description: "La réservation a été enregistrée avec succès.",
    });
    setShowNewReservation(false);
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'confirmed':
        return <Badge className="bg-green-500">Confirmée</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">En attente</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500">Annulée</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <SubscriptionGuard>
      <div className="flex h-screen bg-gray-50">
        <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Réservations</h1>
                <p className="text-gray-600 mt-1">Gérez vos réservations de tables</p>
              </div>
              <Button onClick={() => setShowNewReservation(!showNewReservation)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle réservation
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-auto p-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Aujourd'hui</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">8</div>
                  <p className="text-xs text-gray-500 mt-1">réservations</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Cette semaine</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">45</div>
                  <p className="text-xs text-gray-500 mt-1">réservations</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Couverts ce mois</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">342</div>
                  <p className="text-xs text-gray-500 mt-1">personnes</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Taux de remplissage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">78%</div>
                  <p className="text-xs text-gray-500 mt-1">moyenne mensuelle</p>
                </CardContent>
              </Card>
            </div>

            {/* New Reservation Form */}
            {showNewReservation && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Nouvelle réservation</CardTitle>
                  <CardDescription>Créez une nouvelle réservation pour un client</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleNewReservation} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nom du client</Label>
                        <Input id="name" placeholder="Jean Dupont" required />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Téléphone</Label>
                        <Input id="phone" type="tel" placeholder="+33 6 12 34 56 78" required />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="jean.dupont@example.com" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="guests">Nombre de personnes</Label>
                        <Select required>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner" />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                              <SelectItem key={num} value={num.toString()}>{num} {num === 1 ? 'personne' : 'personnes'}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="date">Date</Label>
                        <Input id="date" type="date" required />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="time">Heure</Label>
                        <Input id="time" type="time" required />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes (optionnel)</Label>
                      <Textarea id="notes" placeholder="Informations supplémentaires..." rows={3} />
                    </div>

                    <div className="flex gap-3">
                      <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                        Créer la réservation
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowNewReservation(false)}>
                        Annuler
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Search and Filter */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Rechercher une réservation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Reservations List */}
            <div className="space-y-4">
              {reservations.map((reservation) => (
                <Card key={reservation.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <User className="h-5 w-5 text-gray-500" />
                            <span className="font-semibold text-gray-900">{reservation.customerName}</span>
                          </div>
                          {getStatusBadge(reservation.status)}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(reservation.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{reservation.time}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>{reservation.guests} {reservation.guests === 1 ? 'personne' : 'personnes'}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span>{reservation.phone}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <span>{reservation.email}</span>
                          </div>
                        </div>

                        {reservation.notes && (
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                            <strong>Note:</strong> {reservation.notes}
                          </div>
                        )}
                      </div>

                      <Button variant="ghost" size="icon" className="ml-4">
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
      <SubscriptionPopup />
    </SubscriptionGuard>
  );
};

export default Reservations;
