
import React, { useState } from 'react';
import ModernSidebar from '@/components/ModernSidebar';
import EmptyState from '@/components/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Mail, Phone, Calendar, Plus, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Clients: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { toast } = useToast();

  // Données de démonstration
  const mockCustomers = [
    {
      id: 1,
      name: "Marie Dupont",
      email: "marie.dupont@email.com",
      phone: "06 12 34 56 78",
      visits: 12,
      lastVisit: "2024-06-10",
      totalSpent: "€ 380,50",
      status: "VIP",
      favorite: true
    },
    {
      id: 2,
      name: "Pierre Martin",
      email: "pierre.martin@email.com",
      phone: "06 98 76 54 32",
      visits: 5,
      lastVisit: "2024-06-08",
      totalSpent: "€ 125,30",
      status: "Régulier",
      favorite: false
    },
    {
      id: 3,
      name: "Sophie Leblanc",
      email: "sophie.leblanc@email.com",
      phone: "06 11 22 33 44",
      visits: 3,
      lastVisit: "2024-06-05",
      totalSpent: "€ 89,90",
      status: "Nouveau",
      favorite: false
    },
    {
      id: 4,
      name: "Jean Durand",
      email: "jean.durand@email.com",
      phone: "06 55 44 33 22",
      visits: 18,
      lastVisit: "2024-06-12",
      totalSpent: "€ 650,20",
      status: "VIP",
      favorite: true
    }
  ];

  const handleAddCustomer = () => {
    toast({
      title: "Nouveau client",
      description: "Fonctionnalité bientôt disponible",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "VIP":
        return "bg-purple-100 text-purple-800";
      case "Régulier":
        return "bg-blue-100 text-blue-800";
      case "Nouveau":
        return "bg-green-100 text-green-800";
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Clients</h1>
              <p className="text-gray-600">Gérez votre base de données clients</p>
            </div>
            <Button onClick={handleAddCustomer} className="flex items-center gap-2">
              <Plus size={16} />
              Nouveau client
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
              Voici à quoi ressemblera votre gestion clients avec de vraies données.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mockCustomers.map((customer) => (
              <Card key={customer.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CardTitle className="text-lg">{customer.name}</CardTitle>
                      {customer.favorite && (
                        <Star size={16} className="text-yellow-500 fill-current" />
                      )}
                    </div>
                    <Badge className={getStatusColor(customer.status)}>
                      {customer.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail size={16} className="mr-2" />
                      {customer.email}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone size={16} className="mr-2" />
                      {customer.phone}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar size={16} className="mr-2" />
                      Dernière visite: {new Date(customer.lastVisit).toLocaleDateString('fr-FR')}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-gray-900">{customer.visits}</div>
                      <div className="text-xs text-gray-600">Visites</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">{customer.totalSpent}</div>
                      <div className="text-xs text-gray-600">Total dépensé</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Modifier
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      Historique
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Clients;
