
import React, { useState } from 'react';
import ModernSidebar from '../components/ModernSidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { 
  Eye, 
  Edit, 
  MessageCircle,
  Plus
} from 'lucide-react';

const Menus: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Tous");
  
  const [menuItems, setMenuItems] = useState([
    { 
      id: 1, 
      name: "Thieboudienne", 
      category: "Plats principaux", 
      price: "2 500 CFA", 
      status: "Disponible",
      description: "Riz au poisson traditionnel sénégalais",
      image: "/lovable-uploads/eedf6dca-ced1-4275-a5ca-db24eefce183.png",
      isActive: true
    },
    { 
      id: 2, 
      name: "Yassa Poulet", 
      category: "Plats principaux", 
      price: "2 000 CFA", 
      status: "Disponible",
      description: "Poulet mariné aux oignons et citron",
      image: "/lovable-uploads/eedf6dca-ced1-4275-a5ca-db24eefce183.png",
      isActive: true
    },
    { 
      id: 3, 
      name: "Mafé", 
      category: "Plats principaux", 
      price: "2 200 CFA", 
      status: "Indisponible",
      description: "Viande en sauce d'arachide",
      image: "/lovable-uploads/eedf6dca-ced1-4275-a5ca-db24eefce183.png",
      isActive: false
    },
    { 
      id: 4, 
      name: "Bissap", 
      category: "Boissons", 
      price: "500 CFA", 
      status: "Disponible",
      description: "Boisson à l'hibiscus",
      image: "/lovable-uploads/eedf6dca-ced1-4275-a5ca-db24eefce183.png",
      isActive: true
    },
    { 
      id: 5, 
      name: "Café Touba", 
      category: "Boissons", 
      price: "300 CFA", 
      status: "Disponible",
      description: "Café épicé traditionnel",
      image: "/lovable-uploads/eedf6dca-ced1-4275-a5ca-db24eefce183.png",
      isActive: true
    }
  ]);

  const categories = ["Tous", "Plats principaux", "Boissons", "Desserts"];

  const filteredItems = activeCategory === "Tous" 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory);

  const handleToggleStatus = (itemId: number) => {
    setMenuItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId 
          ? { 
              ...item, 
              isActive: !item.isActive,
              status: !item.isActive ? "Disponible" : "Indisponible"
            }
          : item
      )
    );
    console.log(`Statut du plat ${itemId} modifié`);
  };

  const handleViewItem = (item: any) => {
    console.log("Viewing item:", item.name);
    // Implement view functionality
  };

  const handleEditItem = (item: any) => {
    console.log("Editing item:", item.name);
    // Implement edit functionality
  };

  const handleAddItem = () => {
    console.log("Adding new item");
    // Implement add new item functionality
  };

  const handleVisitorView = () => {
    console.log("Switching to visitor view");
    // Implement visitor view functionality
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des Menus</h1>
              <p className="text-gray-600">Gérez vos plats, prix et disponibilité</p>
            </div>
            
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={handleVisitorView}
              >
                <Eye size={16} />
                Vue visiteur
              </Button>
              
              <Button 
                className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                onClick={handleAddItem}
              >
                <Plus size={16} />
                Ajouter un plat
              </Button>
            </div>
          </div>

          {/* Categories Filter */}
          <div className="flex gap-2 mb-8">
            {categories.map((category) => (
              <Button
                key={category}
                variant={activeCategory === category ? "default" : "outline"}
                className={`${
                  activeCategory === category 
                    ? "bg-green-600 hover:bg-green-700 text-white" 
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Menu Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <Card key={item.id} className="overflow-hidden shadow-sm border border-gray-200">
                <div className="relative">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-48 object-cover"
                  />
                  <Badge 
                    className={`absolute top-3 right-3 ${
                      item.status === "Disponible" 
                        ? "bg-green-500 text-white" 
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {item.status}
                  </Badge>
                </div>
                
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                    <Badge variant="outline" className="text-xs border-blue-200 text-blue-700 bg-blue-50">
                      {item.category}
                    </Badge>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                  
                  {/* Activation/Désactivation */}
                  <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">
                      {item.isActive ? "Plat activé" : "Plat désactivé"}
                    </span>
                    <Switch
                      checked={item.isActive}
                      onCheckedChange={() => handleToggleStatus(item.id)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-xl font-bold text-green-600">
                      {item.price}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewItem(item)}
                      >
                        <Eye size={14} />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditItem(item)}
                      >
                        <Edit size={14} />
                      </Button>
                      <Button variant="outline" size="sm">
                        <MessageCircle size={14} />
                      </Button>
                    </div>
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

export default Menus;
