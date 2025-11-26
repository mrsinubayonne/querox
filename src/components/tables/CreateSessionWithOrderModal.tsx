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
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Minus, Search, X, AlertCircle } from "lucide-react";
import { useMenuData } from "@/hooks/useMenuData";
import { useAuth } from "@/contexts/AuthContext";
import { useRestaurant } from "@/contexts/RestaurantContext";
import { useDebtors } from "@/hooks/useBusinessCustomers";
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
  const { customers } = useDebtors(outletId || undefined);
  const [numberOfGuests, setNumberOfGuests] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [isDebtorOrder, setIsDebtorOrder] = useState(false);
  const [selectedDebtorId, setSelectedDebtorId] = useState<string>("");

  const selectedDebtor = customers.find(c => c.id === selectedDebtorId);
  const availableCredit = selectedDebtor 
    ? selectedDebtor.credit_limit - selectedDebtor.current_debt 
    : 0;

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
            debtor_id: isDebtorOrder ? selectedDebtorId : null,
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
      setIsDebtorOrder(false);
      setSelectedDebtorId("");
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
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Ouvrir la Table {tableNumber}</DialogTitle>
          <DialogDescription>
            Entrez le nombre de personnes et ajoutez les plats commandés.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex gap-6 overflow-hidden">
          {/* FORMULAIRE - GAUCHE */}
          <div className="flex-1 space-y-4 overflow-y-auto pr-4">
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

            {/* Mode débiteur */}
            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label htmlFor="debtor-mode">Client à crédit / Débiteur</Label>
                <p className="text-sm text-muted-foreground">
                  Facturation avec paiement différé
                </p>
              </div>
              <Switch
                id="debtor-mode"
                checked={isDebtorOrder}
                onCheckedChange={setIsDebtorOrder}
              />
            </div>

            {isDebtorOrder && (
              <div className="space-y-2">
                <Label htmlFor="debtor">Sélectionner le débiteur *</Label>
                <Select value={selectedDebtorId} onValueChange={setSelectedDebtorId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un débiteur" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.filter(c => c.is_active).map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.company_name} - Crédit: {(customer.credit_limit - customer.current_debt).toLocaleString()} FCFA
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedDebtor && (
                  <div className="text-sm space-y-1">
                    <p className="flex items-center gap-2">
                      <span className="font-medium">Crédit disponible:</span>
                      <span className={availableCredit > 0 ? "text-green-600" : "text-red-600"}>
                        {availableCredit.toLocaleString()} FCFA
                      </span>
                    </p>
                    {availableCredit <= 0 && (
                      <div className="flex items-start gap-2 text-destructive">
                        <AlertCircle className="h-4 w-4 mt-0.5" />
                        <span>Ce débiteur a atteint sa limite de crédit</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

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
                <ScrollArea className="h-48 border rounded-md">
                  <div className="p-2 space-y-1">
                    {filteredItems.slice(0, 10).map((item) => (
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

          {/* PANIER - DROITE */}
          <div className="w-[400px] flex flex-col border-l pl-6">
            <div className="flex items-center justify-between mb-3">
              <Label className="text-base font-semibold">Panier ({cart.length})</Label>
              {cart.length > 0 && (
                <span className="text-sm font-medium text-primary">
                  {totalAmount.toLocaleString()} FCFA
                </span>
              )}
            </div>
            
            <ScrollArea className="h-[400px] border rounded-md bg-muted/20 mb-4">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-12 px-4">
                  <p className="text-center">Aucun plat ajouté</p>
                  <p className="text-sm text-center mt-2">Recherchez et ajoutez des plats</p>
                </div>
              ) : (
                <div className="space-y-2 p-3">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-background border rounded-md shadow-sm"
                    >
                      <div className="flex-1 min-w-0 pr-3">
                        <p className="font-medium truncate">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.price.toLocaleString()} × {item.quantity} ={" "}
                          <span className="font-semibold text-foreground">
                            {(item.price * item.quantity).toLocaleString()}
                          </span>
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
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
                          className="h-7 w-7 text-destructive hover:text-destructive ml-1"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            
            {cart.length > 0 && (
              <div className="mb-4 p-4 bg-primary/10 border border-primary/20 rounded-md">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-bold text-xl text-primary">{totalAmount.toLocaleString()} FCFA</span>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Button 
                type="submit" 
                className="w-full"
                disabled={loading || cart.length === 0 || (isDebtorOrder && (!selectedDebtorId || availableCredit < totalAmount))}
              >
                {loading ? "Ouverture..." : "Ouvrir & Commander"}
              </Button>
              <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="w-full">
                Annuler
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
