import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import ModernSidebar from '@/components/ModernSidebar';
import UnauthorizedAccess from '@/components/admin/UnauthorizedAccess';
import { LifeBuoy, MessageSquare, AlertCircle, DollarSign, Clock, User, CheckCircle2 } from 'lucide-react';

const AdminSupport: React.FC = () => {
  const { user } = useAuth();
  const { isAdmin, loading: authLoading } = useSubscription();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const mockTickets = [
    { id: '1', user: 'Restaurant Le Gourmet', subject: 'Problème de connexion', priority: 'high', status: 'open', created: '2024-01-15' },
    { id: '2', user: 'Chez Marie', subject: 'Question sur facturation', priority: 'medium', status: 'in_progress', created: '2024-01-14' },
    { id: '3', user: 'La Terrasse', subject: 'Demande de fonctionnalité', priority: 'low', status: 'open', created: '2024-01-13' },
  ];

  const mockClaims = [
    { id: '1', restaurant: 'Le Bistrot', type: 'refund', amount: 50000, status: 'pending', reason: 'Commande non livrée' },
    { id: '2', restaurant: 'Pizza Palace', type: 'refund', amount: 25000, status: 'approved', reason: 'Produit incorrect' },
  ];

  if (authLoading) {
    return (
      <div className="flex h-screen bg-background">
        <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex h-screen bg-background">
        <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        <UnauthorizedAccess userEmail={user?.email} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div className="flex-1 overflow-auto">
        <div className="p-4 md:p-8 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <LifeBuoy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Support & Réclamations</h1>
              <p className="text-sm text-muted-foreground">Gestion des tickets et réclamations clients</p>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Tickets ouverts</span>
                  <MessageSquare className="w-5 h-5 text-blue-500" />
                </div>
                <div className="text-3xl font-bold">
                  {mockTickets.filter(t => t.status === 'open').length}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">En cours</span>
                  <Clock className="w-5 h-5 text-orange-500" />
                </div>
                <div className="text-3xl font-bold">
                  {mockTickets.filter(t => t.status === 'in_progress').length}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Réclamations</span>
                  <AlertCircle className="w-5 h-5 text-red-500" />
                </div>
                <div className="text-3xl font-bold">
                  {mockClaims.filter(c => c.status === 'pending').length}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Montant à rembourser</span>
                  <DollarSign className="w-5 h-5 text-green-500" />
                </div>
                <div className="text-3xl font-bold">
                  {mockClaims.filter(c => c.status === 'pending')
                    .reduce((sum, c) => sum + c.amount, 0)
                    .toLocaleString('fr-FR')} FCFA
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="tickets" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="tickets">Tickets de Support</TabsTrigger>
              <TabsTrigger value="claims">Réclamations</TabsTrigger>
            </TabsList>

            <TabsContent value="tickets" className="space-y-4">
              {mockTickets.map((ticket) => (
                <Card key={ticket.id} className="border-0 shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{ticket.subject}</h3>
                            <Badge variant={ticket.priority === 'high' ? 'destructive' : 'secondary'}>
                              {ticket.priority}
                            </Badge>
                            <Badge variant="outline">{ticket.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{ticket.user}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Créé le {new Date(ticket.created).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      <Button size="sm">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Répondre
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="claims" className="space-y-4">
              {mockClaims.map((claim) => (
                <Card key={claim.id} className="border-0 shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                          <DollarSign className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{claim.restaurant}</h3>
                            <Badge variant={claim.status === 'pending' ? 'secondary' : 'default'}>
                              {claim.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{claim.reason}</p>
                          <p className="text-sm font-semibold mt-2">
                            Montant: {claim.amount.toLocaleString('fr-FR')} FCFA
                          </p>
                        </div>
                      </div>
                      {claim.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            Refuser
                          </Button>
                          <Button size="sm">
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Approuver
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminSupport;
