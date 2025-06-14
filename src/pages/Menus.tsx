
import React, { useState } from 'react';
import ModernSidebar from '../components/ModernSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus,
  Filter,
  Download,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  Bell
} from 'lucide-react';

const Menus: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const menuItems = [
    { 
      id: 1, 
      name: "Menu du Jour", 
      category: "Principal", 
      price: "25 000 CFA", 
      status: "Actif",
      description: "Plat traditionnel sénégalais avec riz et légumes"
    },
    { 
      id: 2, 
      name: "Thieboudienne", 
      category: "Spécialité", 
      price: "30 000 CFA", 
      status: "Actif",
      description: "Riz au poisson, légumes et sauce tomate"
    },
    { 
      id: 3, 
      name: "Yassa Poulet", 
      category: "Principal", 
      price: "22 000 CFA", 
      status: "Inactif",
      description: "Poulet mariné aux oignons et citron"
    },
    { 
      id: 4, 
      name: "Mafé", 
      category: "Traditionnel", 
      price: "28 000 CFA", 
      status: "Actif",
      description: "Ragoût à la pâte d'arachide avec viande"
    },
    { 
      id: 5, 
      name: "Bissap", 
      category: "Boisson", 
      price: "3 000 CFA", 
      status: "Actif",
      description: "Boisson rafraîchissante à l'hibiscus"
    },
    { 
      id: 6, 
      name: "Café Touba", 
      category: "Boisson", 
      price: "2 500 CFA", 
      status: "Actif",
      description: "Café épicé traditionnel du Sénégal"
    }
  ];

  const categories = ["Tous", "Principal", "Spécialité", "Traditionnel", "Boisson"];

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100/50 px-8 py-6 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                Gestion des Menus
              </h1>
              <p className="text-sm text-gray-500 mt-1 font-medium">
                Gérez vos plats et boissons • {menuItems.length} éléments au total
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Rechercher un plat..."
                  className="pl-10 w-80 border-gray-200/50 bg-white/50 backdrop-blur-sm focus:border-blue-300 focus:ring-blue-300/20"
                />
              </div>
              
              <Button variant="outline" size="icon" className="border-gray-200/50 bg-white/50 backdrop-blur-sm hover:bg-white/80">
                <Filter size={16} />
              </Button>
              
              <Button variant="outline" size="icon" className="border-gray-200/50 bg-white/50 backdrop-blur-sm hover:bg-white/80">
                <Download size={16} />
              </Button>
              
              <Button className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 shadow-lg shadow-green-500/25">
                <Plus size={16} className="mr-2" />
                Nouveau Plat
              </Button>
              
              <Button size="icon" variant="ghost" className="relative hover:bg-gray-100/50">
                <Bell size={20} />
                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full"></span>
              </Button>
            </div>
          </div>
        </header>
        
        <main className="p-8 space-y-8">
          {/* Categories Filter */}
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <Badge 
                key={category}
                variant={category === "Tous" ? "default" : "outline"}
                className={`px-4 py-2 cursor-pointer transition-colors ${
                  category === "Tous" 
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700" 
                    : "hover:bg-gray-100"
                }`}
              >
                {category}
              </Badge>
            ))}
          </div>

          {/* Menu Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map((item) => (
              <Card key={item.id} className="group relative overflow-hidden border-0 shadow-sm bg-white/60 backdrop-blur-sm hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-500">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl font-bold text-gray-900 mb-2">{item.name}</CardTitle>
                      <Badge 
                        variant="outline" 
                        className={`${
                          item.category === "Principal" ? "border-blue-200 text-blue-700 bg-blue-50" :
                          item.category === "Spécialité" ? "border-purple-200 text-purple-700 bg-purple-50" :
                          item.category === "Traditionnel" ? "border-orange-200 text-orange-700 bg-orange-50" :
                          "border-green-200 text-green-700 bg-green-50"
                        }`}
                      >
                        {item.category}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        className={`${
                          item.status === "Actif" 
                            ? "bg-green-50 text-green-700 border-green-200" 
                            : "bg-red-50 text-red-700 border-red-200"
                        }`}
                      >
                        {item.status}
                      </Badge>
                      <Button variant="ghost" size="icon" className="hover:bg-gray-100/50">
                        <MoreHorizontal size={16} />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{item.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{item.price}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="hover:bg-blue-50 hover:border-blue-300">
                        <Eye size={14} className="mr-1" />
                        Voir
                      </Button>
                      <Button variant="outline" size="sm" className="hover:bg-yellow-50 hover:border-yellow-300">
                        <Edit size={14} className="mr-1" />
                        Modifier
                      </Button>
                      <Button variant="outline" size="sm" className="hover:bg-red-50 hover:border-red-300 text-red-600 hover:text-red-700">
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
            <Card className="border-0 shadow-sm bg-white/60 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{menuItems.length}</div>
                <p className="text-sm text-gray-600 font-medium">Total des plats</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-sm bg-white/60 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {menuItems.filter(item => item.status === "Actif").length}
                </div>
                <p className="text-sm text-gray-600 font-medium">Plats actifs</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-sm bg-white/60 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">4</div>
                <p className="text-sm text-gray-600 font-medium">Catégories</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-sm bg-white/60 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">26 500</div>
                <p className="text-sm text-gray-600 font-medium">Prix moyen (CFA)</p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Menus;
