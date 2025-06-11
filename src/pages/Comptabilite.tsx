
import React, { useState } from 'react';
import ModernSidebar from '@/components/ModernSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  FileText, 
  Plus,
  Calendar,
  Download,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';

const Comptabilite = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Données mockées pour les transactions
  const recentTransactions = [
    { id: 1, date: '2024-06-10', description: 'Vente restaurant', montant: 450.75, type: 'revenus', statut: 'validé' },
    { id: 2, date: '2024-06-10', description: 'Achat ingrédients', montant: -125.30, type: 'depenses', statut: 'validé' },
    { id: 3, date: '2024-06-09', description: 'Vente à emporter', montant: 89.50, type: 'revenus', statut: 'en_attente' },
    { id: 4, date: '2024-06-09', description: 'Facture électricité', montant: -180.00, type: 'depenses', statut: 'validé' },
    { id: 5, date: '2024-06-08', description: 'Vente traiteur', montant: 750.00, type: 'revenus', statut: 'validé' },
  ];

  const factures = [
    { id: 'FAC-001', client: 'Restaurant Martin', date: '2024-06-10', montant: 450.75, statut: 'payée' },
    { id: 'FAC-002', client: 'Événement mariage', date: '2024-06-08', montant: 750.00, statut: 'payée' },
    { id: 'FAC-003', client: 'Commande entreprise', date: '2024-06-07', montant: 320.50, statut: 'en_attente' },
    { id: 'FAC-004', client: 'Traiteur anniversaire', date: '2024-06-05', montant: 280.00, statut: 'en_retard' },
  ];

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case 'validé':
      case 'payée':
        return <Badge className="bg-green-100 text-green-800">Validé</Badge>;
      case 'en_attente':
        return <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>;
      case 'en_retard':
        return <Badge className="bg-red-100 text-red-800">En retard</Badge>;
      default:
        return <Badge>{statut}</Badge>;
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-gray-50">
      <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Comptabilité</h1>
              <p className="text-gray-600 mt-1">Gestion financière et comptable</p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" className="flex items-center space-x-2">
                <Download size={16} />
                <span>Exporter</span>
              </Button>
              <Button className="flex items-center space-x-2">
                <Plus size={16} />
                <span>Nouvelle transaction</span>
              </Button>
            </div>
          </div>

          {/* Statistiques rapides */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenus du mois</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">€2,840.25</div>
                <p className="text-xs text-muted-foreground">+12% par rapport au mois dernier</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Dépenses du mois</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">€1,205.30</div>
                <p className="text-xs text-muted-foreground">-5% par rapport au mois dernier</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bénéfice net</CardTitle>
                <DollarSign className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">€1,634.95</div>
                <p className="text-xs text-muted-foreground">Marge: 57.5%</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Factures impayées</CardTitle>
                <FileText className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">€600.50</div>
                <p className="text-xs text-muted-foreground">3 factures en attente</p>
              </CardContent>
            </Card>
          </div>

          {/* Contenu principal avec onglets */}
          <Tabs defaultValue="transactions" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="factures">Factures</TabsTrigger>
              <TabsTrigger value="rapports">Rapports</TabsTrigger>
              <TabsTrigger value="parametres">Paramètres</TabsTrigger>
            </TabsList>

            {/* Onglet Transactions */}
            <TabsContent value="transactions" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Transactions récentes</CardTitle>
                  <CardDescription>
                    Liste des dernières transactions financières
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>{transaction.date}</TableCell>
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell>
                            <Badge variant={transaction.type === 'revenus' ? 'default' : 'secondary'}>
                              {transaction.type === 'revenus' ? 'Revenus' : 'Dépenses'}
                            </Badge>
                          </TableCell>
                          <TableCell className={transaction.montant > 0 ? 'text-green-600' : 'text-red-600'}>
                            €{Math.abs(transaction.montant).toFixed(2)}
                          </TableCell>
                          <TableCell>{getStatutBadge(transaction.statut)}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm">
                                <Eye size={16} />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit size={16} />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Onglet Factures */}
            <TabsContent value="factures" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Gestion des factures</CardTitle>
                  <CardDescription>
                    Créez et gérez vos factures clients
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>N° Facture</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {factures.map((facture) => (
                        <TableRow key={facture.id}>
                          <TableCell className="font-medium">{facture.id}</TableCell>
                          <TableCell>{facture.client}</TableCell>
                          <TableCell>{facture.date}</TableCell>
                          <TableCell>€{facture.montant.toFixed(2)}</TableCell>
                          <TableCell>{getStatutBadge(facture.statut)}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm">
                                <Eye size={16} />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Download size={16} />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit size={16} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Onglet Rapports */}
            <TabsContent value="rapports" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Rapport mensuel</CardTitle>
                    <CardDescription>Générer un rapport pour une période donnée</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Date de début</Label>
                        <Input type="date" />
                      </div>
                      <div>
                        <Label>Date de fin</Label>
                        <Input type="date" />
                      </div>
                    </div>
                    <Button className="w-full">
                      <Calendar className="mr-2 h-4 w-4" />
                      Générer le rapport
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Analyse financière</CardTitle>
                    <CardDescription>Vue d'ensemble de la performance</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Chiffre d'affaires</span>
                        <span className="font-semibold">€2,840.25</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Charges</span>
                        <span className="font-semibold">€1,205.30</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span>Résultat net</span>
                        <span className="font-bold text-green-600">€1,634.95</span>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">
                      <Download className="mr-2 h-4 w-4" />
                      Exporter l'analyse
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Onglet Paramètres */}
            <TabsContent value="parametres" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Paramètres comptables</CardTitle>
                  <CardDescription>
                    Configuration de votre système comptable
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Devise par défaut</Label>
                      <Input defaultValue="EUR (€)" />
                    </div>
                    <div>
                      <Label>Taux de TVA (%)</Label>
                      <Input defaultValue="20" type="number" />
                    </div>
                    <div>
                      <Label>Période fiscale</Label>
                      <Input defaultValue="Janvier - Décembre" />
                    </div>
                    <div>
                      <Label>Numérotation factures</Label>
                      <Input defaultValue="FAC-{YYYY}-{###}" />
                    </div>
                  </div>
                  <Button>Enregistrer les paramètres</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Comptabilite;
