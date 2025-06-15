
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface Menu {
  id: string;
  name: string;
  description?: string;
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
        .select("id, name, description")
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
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-xl font-bold text-blue-700">{menu.name}</span>
                  {menu.description && (
                    <span className="text-gray-500 text-sm">{menu.description}</span>
                  )}
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
    </div>
  );
};

export default AllMenus;
