import React, { useState } from 'react';
import PageWithSidebar from '@/components/PageWithSidebar';
import SubscriptionGuard from '@/components/SubscriptionGuard';
import { useReservations } from '@/hooks/useReservations';
import { Calendar, Clock, Users, Phone, Mail, User, Plus, Search, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import SubscriptionPopup from '@/components/SubscriptionPopup';
import EmptyState from '@/components/EmptyState';

const Reservations: React.FC = () => {
  const { reservations, loading, createReservation, updateReservation, deleteReservation, getReservationStats } = useReservations();
  const [showNewReservation, setShowNewReservation] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const stats = getReservationStats();

  const handleNewReservation = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const reservationData = {
      customer_name: formData.get('name') as string,
      customer_phone: formData.get('phone') as string,
      customer_email: formData.get('email') as string || undefined,
      reservation_date: formData.get('date') as string,
      reservation_time: formData.get('time') as string,
      party_size: parseInt(formData.get('guests') as string),
      special_requests: formData.get('notes') as string || undefined,
      status: 'pending' as const,
      table_number: formData.get('table') as string || undefined,
    };

    const success = await createReservation(reservationData);
    if (success) {
      setShowNewReservation(false);
      e.currentTarget.reset();
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    await updateReservation(id, { status: status as any });
  };

  const handleDeleteReservation = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette réservation ?')) {
      await deleteReservation(id);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'confirmed':
        return <Badge className="bg-emerald-500">Confirmée</Badge>;
      case 'pending':
        return <Badge className="bg-amber-500">En attente</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Annulée</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500">Terminée</Badge>;
      case 'no_show':
        return <Badge variant="outline">Absent</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const filteredReservations = reservations.filter(reservation =>
    reservation.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reservation.customer_phone.includes(searchQuery) ||
    (reservation.customer_email && reservation.customer_email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <SubscriptionGuard feature="la gestion des réservations">
      <PageWithSidebar>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Réservations</h1>
              <p className="text-muted-foreground">Gérez vos réservations de tables</p>
            </div>
            <div className="flex gap-2">
              <Dialog open={showNewReservation} onOpenChange={setShowNewReservation}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Nouvelle réservation
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Nouvelle réservation</DialogTitle>
                    <DialogDescription>Créez une nouvelle réservation pour un client</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleNewReservation} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nom du client *</Label>
                        <Input id="name" name="name" placeholder="Jean Dupont" required />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Téléphone *</Label>
                        <Input id="phone" name="phone" type="tel" placeholder="+33 6 12 34 56 78" required />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" placeholder="jean.dupont@example.com" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="guests">Nombre de personnes *</Label>
                        <Select name="guests" required>
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
                        <Label htmlFor="date">Date *</Label>
                        <Input id="date" name="date" type="date" required />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="time">Heure *</Label>
                        <Input id="time" name="time" type="time" required />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="table">Numéro de table</Label>
                        <Input id="table" name="table" placeholder="Table 5" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea id="notes" name="notes" placeholder="Informations supplémentaires..." rows={3} />
                    </div>

                    <div className="flex gap-3">
                      <Button type="submit">Créer la réservation</Button>
                      <Button type="button" variant="outline" onClick={() => setShowNewReservation(false)}>Annuler</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Aujourd'hui</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.todayCount}</div>
                <p className="text-xs text-muted-foreground mt-1">réservations</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Cette semaine</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.weekCount}</div>
                <p className="text-xs text-muted-foreground mt-1">réservations</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Couverts ce mois</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.monthGuestsCount}</div>
                <p className="text-xs text-muted-foreground mt-1">personnes</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Taux de confirmation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.confirmedRate}%</div>
                <p className="text-xs text-muted-foreground mt-1">des réservations</p>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              placeholder="Rechercher une réservation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Reservations List */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : filteredReservations.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="Aucune réservation"
              description={searchQuery ? "Aucune réservation ne correspond à votre recherche" : "Créez votre première réservation pour commencer"}
            />
          ) : (
            <div className="space-y-4">
              {filteredReservations.map((reservation) => (
                <Card key={reservation.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <User className="h-5 w-5 text-muted-foreground" />
                            <span className="font-semibold">{reservation.customer_name}</span>
                          </div>
                          {getStatusBadge(reservation.status)}
                          {reservation.table_number && (
                            <Badge variant="outline">{reservation.table_number}</Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(reservation.reservation_date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{reservation.reservation_time}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>{reservation.party_size} {reservation.party_size === 1 ? 'personne' : 'personnes'}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span>{reservation.customer_phone}</span>
                          </div>

                          {reservation.customer_email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              <span>{reservation.customer_email}</span>
                            </div>
                          )}
                        </div>

                        {reservation.special_requests && (
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                            <strong>Note:</strong> {reservation.special_requests}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        <Select value={reservation.status} onValueChange={(value) => handleUpdateStatus(reservation.id, value)}>
                          <SelectTrigger className="w-36">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">En attente</SelectItem>
                            <SelectItem value="confirmed">Confirmée</SelectItem>
                            <SelectItem value="completed">Terminée</SelectItem>
                            <SelectItem value="cancelled">Annulée</SelectItem>
                            <SelectItem value="no_show">Absent</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteReservation(reservation.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
        <SubscriptionPopup />
      </PageWithSidebar>
    </SubscriptionGuard>
  );
};

export default Reservations;
