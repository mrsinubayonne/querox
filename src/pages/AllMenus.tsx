
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRightLeft } from "lucide-react";
import TransferMenuModal from "@/components/TransferMenuModal";
import { useOutlets } from "@/hooks/useOutlets";
import { useMenus } from "@/hooks/useMenus";

interface Menu {
  id: string;
  name: string;
  description?: string;
  outlet_id: string | null;
  categories: MenuCategory[];
}

interface MenuCategory {
  id: string;
  name: string;
  description?: string;
}

const AllMenus: React.FC = () => {
  const { user } = useAuth();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const { outlets } = useOutlets();
  const { transferMenu } = useMenus();

  useEffect(() => {
    const fetchMenusAndCategories = async () => {
      setLoading(true);
      if (!user) {
        setMenus([]);
        setLoading(false);
        return;
      }

      // Get all menus for the user
      const { data: menusData, error: menusError } = await supabase
        .from("menus")
        .select("id, name, description, outlet_id")
        .eq("user_id", user.id);

      if (menusError || !menusData) {
        setMenus([]);
        setLoading(false);
        return;
      }

      // For each menu, get its categories
      const allMenus: Menu[] = [];
      for (const menu of menusData) {
        const { data: categoriesData } = await supabase
          .from("menu_categories")
          .select("id, name, description")
          .eq("menu_id", menu.id)
          .order("order_index");
        allMenus.push({
          ...menu,
          categories: categoriesData || [],
        });
      }

      setMenus(allMenus);
      setLoading(false);
    };

    fetchMenusAndCategories();
  }, [user]);

  const handleTransferClick = (menu: Menu) => {
    setSelectedMenu(menu);
    setTransferModalOpen(true);
  };

  const handleTransferConfirm = async (outletId: string) => {
    if (!selectedMenu) return;
    const success = await transferMenu(selectedMenu.id, outletId);
    if (success) {
      fetchMenusAndCategories();
    }
  };

  const getOutletName = (outletId: string | null) => {
    if (!outletId) return "Aucun PDV";
    const outlet = outlets.find(o => o.id === outletId);
    return outlet?.name || "PDV inconnu";
  };

  const fetchMenusAndCategories = async () => {
    setLoading(true);
    if (!user) {
      setMenus([]);
      setLoading(false);
      return;
    }

    const { data: menusData, error: menusError } = await supabase
      .from("menus")
      .select("id, name, description, outlet_id")
      .eq("user_id", user.id);

    if (menusError || !menusData) {
      setMenus([]);
      setLoading(false);
      return;
    }

    const allMenus: Menu[] = [];
    for (const menu of menusData) {
      const { data: categoriesData } = await supabase
        .from("menu_categories")
        .select("id, name, description")
        .eq("menu_id", menu.id)
        .order("order_index");
      allMenus.push({
        ...menu,
        categories: categoriesData || [],
      });
    }

    setMenus(allMenus);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-extrabold text-gray-900">Tous les menus & catégories</h1>
          <Link to="/menus">
            <Button variant="outline">Retour à la gestion des plats</Button>
          </Link>
        </div>

        {loading ? (
          <div className="text-center text-gray-500 mt-10">Chargement…</div>
        ) : menus.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">Aucun menu trouvé.</div>
        ) : (
          <div className="space-y-8">
            {menus.map((menu) => (
              <Card key={menu.id} className="px-6 py-4 shadow-sm border">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-blue-700">{menu.name}</span>
                    {menu.description && (
                      <span className="text-gray-500 text-sm">{menu.description}</span>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTransferClick(menu)}
                    className="flex items-center gap-2"
                  >
                    <ArrowRightLeft size={16} />
                    Transférer
                  </Button>
                </div>
                <div className="mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {getOutletName(menu.outlet_id)}
                  </Badge>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {menu.categories.length > 0 ? (
                    menu.categories.map((cat) => (
                      <Badge key={cat.id} className="bg-green-100 text-green-800">
                        {cat.name}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-gray-400 text-sm">Aucune catégorie</span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {selectedMenu && (
        <TransferMenuModal
          isOpen={transferModalOpen}
          onClose={() => {
            setTransferModalOpen(false);
            setSelectedMenu(null);
          }}
          onConfirm={handleTransferConfirm}
          menuName={selectedMenu.name}
          outlets={outlets}
          currentOutletId={selectedMenu.outlet_id}
        />
      )}
    </div>
  );
};

export default AllMenus;
