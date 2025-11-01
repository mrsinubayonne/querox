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
  const [numberOfGuests, setNumberOfGuests] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

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

      const { data: menus } = await supabase
        .from("menus")
        .select("id")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .eq("outlet_id", outletId)
        .limit(1)
        .maybeSingle();

      if (menus) {
        setActiveMenuId(menus.id);
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
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1 }];
    });
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
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Ouvrir la Table {tableNumber}</DialogTitle>
          <DialogDescription>
            Entrez le nombre de personnes et ajoutez les plats commandés.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="space-y-4 pb-4">
            {/* Nombre de personnes */}
            <div className="space-y-2">
              <Label htmlFor="guests">Nombre de personnes (optionnel)</Label>
              <Input
                id="guests"
                type="number"
                min="1"
                placeholder="Ex: 4"
                value={numberOfGuests}
                onChange={(e) => setNumberOfGuests(e.target.value)}
              />
            </div>

            <Separator />

            {/* Recherche de plats */}
            <div className="space-y-2">
              <Label htmlFor="search">Rechercher un plat</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Nom du plat..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              {filteredItems.length > 0 && (
                <ScrollArea className="h-32 border rounded-md">
                  <div className="p-2 space-y-1">
                    {filteredItems.slice(0, 5).map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => addToCart(item)}
                        className="w-full text-left p-2 hover:bg-accent rounded-md text-sm flex justify-between items-center"
                      >
                        <span>{item.name}</span>
                        <span className="text-muted-foreground">
                          {item.price.toLocaleString()} FCFA
                        </span>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              )}
              {filteredItems.length === 0 && activeMenuId && (
                <p className="text-sm text-muted-foreground">Aucun plat trouvé</p>
              )}
            </div>
          </div>

          {/* Panier */}
          <div className="flex-1 overflow-hidden flex flex-col border-t pt-4">
            <Label className="mb-2">Plats commandés ({cart.length})</Label>
            <ScrollArea className="flex-1">
              {cart.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  Aucun plat ajouté. Recherchez et ajoutez des plats.
                </div>
              ) : (
                <div className="space-y-2 pr-4">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-accent/50 rounded-md"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.price.toLocaleString()} FCFA × {item.quantity} ={" "}
                          {(item.price * item.quantity).toLocaleString()} FCFA
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          onClick={() => updateQuantity(item.id, -1)}
                          className="h-8 w-8"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          onClick={() => updateQuantity(item.id, 1)}
                          className="h-8 w-8"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() => removeFromCart(item.id)}
                          className="h-8 w-8"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            
            {cart.length > 0 && (
              <div className="mt-4 p-3 bg-primary/10 rounded-md">
                <div className="flex justify-between items-center font-bold text-lg">
                  <span>Total</span>
                  <span>{totalAmount.toLocaleString()} FCFA</span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading || cart.length === 0}>
              {loading ? "Création..." : "Ouvrir & Commander"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
