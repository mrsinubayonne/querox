
import React, { useState } from 'react';
import ModernSidebar from '../components/ModernSidebar';
import ModernStatCard from '../components/ModernStatCard';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { 
  Users,
  UserPlus,
  Search,
  Filter,
  Download,
  Star,
  Phone,
  Mail,
  MapPin,
  Calendar,
  TrendingUp,
  Heart,
  ShoppingBag
} from "lucide-react";

const Clients: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Données des clients
  const clients = [
    {
      id: 1,
      nom: "Aminata Diallo",
      email: "aminata.diallo@email.com",
      telephone: "+221 77 123 45 67",
      adresse: "Dakar, Plateau",
      dateInscription: "2024-01-15",
      commandes: 24,
      totalDepense: 720000,
      statut: "VIP",
      dernierAchat: "2024-06-08"
    },
    {
      id: 2,
      nom: "Moussa Ba",
      email: "moussa.ba@email.com",
      telephone: "+221 70 987 65 43",
      adresse: "Thiès, Centre-ville",
      dateInscription: "2024-02-20",
      commandes: 18,
      totalDepense: 540000,
      statut: "Fidèle",
      dernierAchat: "2024-06-10"
    },
    {
      id: 3,
      nom: "Fatou Sow",
      email: "fatou.sow@email.com",
      telephone: "+221 76 456 78 90",
      adresse: "Saint-Louis, Sor",
      dateInscription: "2024-03-10",
      commandes: 12,
      totalDepense: 360000,
      statut: "Régulier",
      dernierAchat: "2024-06-09"
    },
    {
      id: 4,
      nom: "Ousmane Ndiaye",
      email: "ousmane.ndiaye@email.com",
      telephone: "+221 78 234 56 78",
      adresse: "Kaolack, Médina",
      dateInscription: "2024-04-05",
      commandes: 8,
      totalDepense: 240000,
      statut: "Nouveau",
      dernierAchat: "2024-06-07"
    },
    {
      id: 5,
      nom: "Aïssatou Thiam",
      email: "aissatou.thiam@email.com",
      telephone: "+221 77 345 67 89",
      adresse: "Ziguinchor, Centre",
      dateInscription: "2024-05-12",
      commandes: 15,
      totalDepense: 450000,
      statut: "Fidèle",
      dernierAchat: "2024-06-11"
    }
  ];

  // Données de segmentation des clients
  const clientSegmentation = [
    { name: 'VIP', value: 15, color: '#8b5cf6' },
    { name: 'Fidèles', value: 35, color: '#10b981' },
    { name: 'Réguliers', value: 30, color: '#f59e0b' },
    { name: 'Nouveaux', value: 20, color: '#3b82f6' }
  ];

  // Données d'évolution des clients
  const clientEvolution = [
    { month: 'Jan', nouveaux: 45, total: 245 },
    { month: 'Fév', nouveaux: 52, total: 297 },
    { month: 'Mar', nouveaux: 38, total: 335 },
    { month: 'Avr', nouveaux: 61, total: 396 },
    { month: 'Mai', nouveaux: 48, total: 444 },
    { month: 'Juin', nouveaux: 35, total: 479 }
  ];

  const filteredClients = clients.filter(client =>
    client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'VIP': return 'bg-purple-100 text-purple-800';
      case 'Fidèle': return 'bg-green-100 text-green-800';
      case 'Régulier': return 'bg-yellow-100 text-yellow-800';
      case 'Nouveau': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR').format(value) + ' CFA';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Gestion des Clients</h1>
              <p className="text-gray-600">Analysez et gérez votre base de clients</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex items-center gap-2">
                <Filter size={16} />
                Filtrer
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Download size={16} />
                Exporter
              </Button>
              <Button className="flex items-center gap-2">
                <UserPlus size={16} />
                Nouveau Client
              </Button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <ModernStatCard
              title="Total clients"
              value="479"
              icon={<Users size={24} />}
              change={{ value: "8%", label: "vs mois dernier", isPositive: true }}
              trend="up"
              color="blue"
            />
            <ModernStatCard
              title="Nouveaux ce mois"
              value="35"
              icon={<UserPlus size={24} />}
              change={{ value: "12%", label: "vs mois dernier", isPositive: true }}
              trend="up"
              color="green"
            />
            <ModernStatCard
              title="Clients VIP"
              value="72"
              icon={<Star size={24} />}
              change={{ value: "5%", label: "vs mois dernier", isPositive: true }}
              trend="up"
              color="purple"
            />
            <ModernStatCard
              title="Panier moyen"
              value="30,000 CFA"
              icon={<ShoppingBag size={24} />}
              change={{ value: "3%", label: "vs mois dernier", isPositive: false }}
              trend="down"
              color="orange"
            />
          </div>

          {/* Tabs */}
          <Tabs defaultValue="liste" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="liste">Liste des Clients</TabsTrigger>
              <TabsTrigger value="analyse">Analyse</TabsTrigger>
              <TabsTrigger value="fidelite">Fidélité</TabsTrigger>
            </TabsList>

            <TabsContent value="liste" className="space-y-6">
              {/* Barre de recherche */}
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <Input
                    placeholder="Rechercher un client..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Liste des clients */}
              <Card>
                <CardHeader>
                  <CardTitle>Clients ({filteredClients.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredClients.map((client) => (
                      <div key={client.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-lg">
                              {client.nom.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{client.nom}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Mail size={14} />
                                {client.email}
                              </span>
                              <span className="flex items-center gap-1">
                                <Phone size={14} />
                                {client.telephone}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                              <span className="flex items-center gap-1">
                                <MapPin size={14} />
                                {client.adresse}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar size={14} />
                                Inscrit le {formatDate(client.dateInscription)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(client.statut)}>
                            {client.statut}
                          </Badge>
                          <div className="mt-2 text-sm">
                            <div className="font-semibold">{client.commandes} commandes</div>
                            <div className="text-gray-600">{formatCurrency(client.totalDepense)}</div>
                            <div className="text-xs text-gray-500">Dernier achat: {formatDate(client.dernierAchat)}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analyse" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Segmentation des clients */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users size={20} />
                      Segmentation des Clients
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={clientSegmentation}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}%`}
                        >
                          {clientSegmentation.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Évolution des clients */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp size={20} />
                      Évolution des Clients
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={clientEvolution}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                        <YAxis stroke="#64748b" fontSize={12} />
                        <Tooltip />
                        <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={3} name="Total clients" />
                        <Line type="monotone" dataKey="nouveaux" stroke="#10b981" strokeWidth={2} name="Nouveaux clients" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="fidelite">
              <Card className="p-6">
                <div className="text-center text-gray-500">
                  <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Programme de Fidélité</p>
                  <p className="text-sm">Gérez les points de fidélité et les récompenses clients</p>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Clients;
