
import React, { useState } from 'react';
import ModernSidebar from '../components/ModernSidebar';
import MenuHeader from '../components/MenuHeader';
import CategoryFilter from '../components/CategoryFilter';
import MenuCard from '../components/MenuCard';

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
          <MenuHeader 
            onVisitorView={handleVisitorView}
            onAddItem={handleAddItem}
          />

          <CategoryFilter 
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />

          {/* Menu Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <MenuCard
                key={item.id}
                item={item}
                onToggleStatus={handleToggleStatus}
                onViewItem={handleViewItem}
                onEditItem={handleEditItem}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Menus;
