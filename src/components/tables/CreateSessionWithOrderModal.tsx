import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Plus, Minus, Search, X } from "lucide-react";
import { useMenuData } from "@/hooks/useMenuData";
import { useAuth } from "@/contexts/AuthContext";
import { useRestaurant } from "@/contexts/RestaurantContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CreateSessionWithOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tableNumber: string;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export const CreateSessionWithOrderModal: React.FC<CreateSessionWithOrderModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  tableNumber,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { outletId } = useRestaurant();
  const [numberOfGuests, setNumberOfGuests] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [showCustomItem, setShowCustomItem] = useState(false);
  const [customItemName, setCustomItemName] = useState("");
  const [customItemPrice, setCustomItemPrice] = useState("");

  // Fetch user's active menu
  React.useEffect(() => {
    const fetchActiveMenu = async () => {
      if (!user) return;
      
      const selectedProfileId = localStorage.getItem('selectedProfileId');
      let outletId: string | null = null;
      if (selectedProfileId) {
        const { data: userProfile } = await supabase
          .from('user_profiles')
          .select('selected_outlet_id')
          .eq('id', selectedProfileId)
          .maybeSingle();
        outletId = (userProfile as any)?.selected_outlet_id ?? null;
      } else {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('selected_outlet_id')
          .eq('user_id', user.id)
          .maybeSingle();
        outletId = (profile as any)?.selected_outlet_id ?? null;
      }

      let { data: menus } = await supabase
        .from("menus")
        .select("id")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .eq("outlet_id", outletId)
        .limit(1)
        .maybeSingle();

      if (!menus) {
        const fallback = await supabase
          .from("menus")
          .select("id")
          .eq("user_id", user.id)
          .eq("is_active", true)
          .limit(1)
          .maybeSingle();
        menus = fallback.data as any;
      }

      if (menus) {
        setActiveMenuId((menus as any).id);
      } else {
        setActiveMenuId(null);
      }
    };

    if (isOpen) {
      fetchActiveMenu();
    }
  }, [user, isOpen]);

  const { menuItems } = useMenuData(activeMenuId);

  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return menuItems;
    const term = searchTerm.toLowerCase();
    return menuItems.filter(
      (item) =>
        item.name.toLowerCase().includes(term) ||
        (item.description && item.description.toLowerCase().includes(term))
    );
  }, [menuItems, searchTerm]);

  const addToCart = (item: typeof menuItems[0]) => {
    const itemData = menuItems.find(m => m.id === item.id);
    
    // Si c'est un plat personnalisable, demander le prix et le nom
    if (itemData && (itemData as any).is_custom_price) {
      const customPrice = prompt("Entrez le prix pour ce plat:");
      const customName = (itemData as any).is_custom_name 
        ? prompt("Entrez le nom du plat:", item.name) 
        : item.name;
      
      if (!customPrice || isNaN(Number(customPrice))) return;
      
      setCart((prev) => [
        ...prev, 
        { 
          id: item.id + Date.now(), // Unique ID pour chaque plat custom
          name: customName || item.name, 
          price: Number(customPrice), 
          quantity: 1 
        }
      ]);
    } else {
      setCart((prev) => {
        const existing = prev.find((i) => i.id === item.id);
        if (existing) {
          return prev.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          );
        }
        return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1 }];
      });
    }
    setSearchTerm("");
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) => {
      const updated = prev.map((item) => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      });
      return updated.filter((item) => item.quantity > 0);
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const addCustomItem = () => {
    if (!customItemName.trim() || !customItemPrice) {
      toast({
        title: "Champs requis",
        description: "Veuillez renseigner le nom et le prix de l'article.",
        variant: "destructive",
      });
      return;
    }

    const price = Number(customItemPrice);
    if (isNaN(price) || price <= 0) {
      toast({
        title: "Prix invalide",
        description: "Le prix doit être un nombre positif.",
        variant: "destructive",
      });
      return;
    }

    const newItem: CartItem = {
      id: `custom-${Date.now()}`,
      name: customItemName,
      price: price,
      quantity: 1,
    };

    setCart((prev) => [...prev, newItem]);
    setCustomItemName("");
    setCustomItemPrice("");
    setShowCustomItem(false);
    
    toast({
      title: "Article ajouté",
      description: `${customItemName} ajouté au panier.`,
    });
  };

  const totalAmount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (cart.length === 0) {
      toast({
        title: "Panier vide",
        description: "Veuillez ajouter au moins un plat à la commande.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (!user) throw new Error("Non authentifié");

      const selectedProfileId = localStorage.getItem('selectedProfileId');
      let outletId: string | null = null;
      if (selectedProfileId) {
        const { data: userProfile } = await supabase
          .from('user_profiles')
          .select('selected_outlet_id')
          .eq('id', selectedProfileId)
          .maybeSingle();
        outletId = (userProfile as any)?.selected_outlet_id ?? null;
      } else {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('selected_outlet_id')
          .eq('user_id', user.id)
          .maybeSingle();
        outletId = (profile as any)?.selected_outlet_id ?? null;
      }

      // 1. Créer la session
      const { data: session, error: sessionError } = await supabase
        .from("table_sessions")
        .insert([
          {
            user_id: user.id,
            outlet_id: outletId,
            table_number: tableNumber,
            number_of_guests: parseInt(numberOfGuests) || 1,
            status: "active",
          },
        ])
        .select()
        .single();

      if (sessionError) throw sessionError;

      // 2. Créer la commande avec les items
      const orderItems = cart.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      }));

      const { error: orderError } = await supabase.from("orders").insert([
        {
          user_id: user.id,
          outlet_id: outletId,
          session_id: session.id,
          table_number: tableNumber,
          order_type: "sur_place",
          customer_name: `Table ${tableNumber}`,
          items: orderItems,
          total_amount: totalAmount,
          status: "pending",
        },
      ]);

      if (orderError) throw orderError;

      toast({
        title: "Session créée",
        description: `Table ${tableNumber} ouverte avec ${cart.length} plat(s).`,
      });

      setNumberOfGuests("");
      setCart([]);
      setSearchTerm("");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error creating session with order:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la session.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[85vh] p-0 gap-0 overflow-hidden">
        {/* Header compact */}
        <div className="p-4 pb-3 border-b bg-gradient-to-r from-primary/5 to-transparent">
          <DialogTitle className="text-lg font-semibold">
            Table {tableNumber}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-0.5">
            Ajoutez les plats commandés
          </DialogDescription>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
          {/* Contenu scrollable */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Nombre de personnes - compact */}
            <div className="flex items-center gap-3">
              <Label htmlFor="guests" className="text-sm whitespace-nowrap">Personnes :</Label>
              <Input
                id="guests"
                type="number"
                min="1"
                placeholder="Ex: 4"
                value={numberOfGuests}
                onChange={(e) => setNumberOfGuests(e.target.value)}
                className="w-24 h-9"
              />
            </div>

            {/* Recherche de plats */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un plat..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>
              
              {filteredItems.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1">
                  {filteredItems.slice(0, 8).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => addToCart(item)}
                      className="text-left p-3 bg-muted/50 hover:bg-primary/10 hover:border-primary/30 border rounded-lg transition-colors flex justify-between items-center gap-2"
                    >
                      <span className="font-medium text-sm truncate">{item.name}</span>
                      <span className="text-xs text-primary font-semibold whitespace-nowrap">
                        {item.price.toLocaleString()} F
                      </span>
                    </button>
                  ))}
                </div>
              )}
              
              {filteredItems.length === 0 && activeMenuId && searchTerm && (
                <p className="text-sm text-muted-foreground text-center py-2">Aucun plat trouvé</p>
              )}
            </div>

            {/* Bouton article libre */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowCustomItem(!showCustomItem)}
              className="w-full border-dashed"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un article libre
            </Button>

            {/* Custom item form */}
            {showCustomItem && (
              <div className="p-4 border rounded-lg bg-accent/5 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="custom-name" className="text-xs">Nom *</Label>
                    <Input
                      id="custom-name"
                      placeholder="Plat du jour"
                      value={customItemName}
                      onChange={(e) => setCustomItemName(e.target.value)}
                      className="h-9 mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="custom-price" className="text-xs">Prix (FCFA) *</Label>
                    <Input
                      id="custom-price"
                      type="number"
                      min="0"
                      placeholder="5000"
                      value={customItemPrice}
                      onChange={(e) => setCustomItemPrice(e.target.value)}
                      className="h-9 mt-1"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="button" size="sm" onClick={addCustomItem} className="flex-1 h-8">
                    Ajouter
                  </Button>
                  <Button 
                    type="button" 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => {
                      setShowCustomItem(false);
                      setCustomItemName("");
                      setCustomItemPrice("");
                    }}
                    className="h-8"
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            )}

            {/* Panier */}
            {cart.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Commande ({cart.length} article{cart.length > 1 ? 's' : ''})</Label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 p-2 bg-background border rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.price.toLocaleString()} F × {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          onClick={() => updateQuantity(item.id, -1)}
                          className="h-7 w-7"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          onClick={() => updateQuantity(item.id, 1)}
                          className="h-7 w-7"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() => removeFromCart(item.id)}
                          className="h-7 w-7 text-destructive hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer fixe */}
          <div className="border-t bg-muted/30 p-4 space-y-3">
            {cart.length > 0 && (
              <div className="flex justify-between items-center px-1">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-bold text-primary">{totalAmount.toLocaleString()} FCFA</span>
              </div>
            )}
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose} 
                disabled={loading}
                className="flex-1 h-11"
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                className="flex-1 h-11 font-semibold"
                disabled={loading || cart.length === 0}
              >
                {loading ? "Ouverture..." : "Ouvrir & Commander"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
