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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Plus, Minus, Search, X, User } from "lucide-react";
import { useInternalMenuItems } from "@/hooks/useInternalMenuItems";
import { useCustomers } from "@/hooks/useCustomers";
import { useAuth } from "@/contexts/AuthContext";
import { useRestaurant } from "@/contexts/RestaurantContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { useMenuItemOptionsPicker } from "@/components/menu-management/useMenuItemOptionsPicker";
import type { SelectedOption } from "@/types/menu";

interface AddOrderFromCustomerModalProps {
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
  selected_options?: SelectedOption[];
  options_label?: string;
}

export const AddOrderFromCustomerModal: React.FC<AddOrderFromCustomerModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  tableNumber,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { outletId } = useRestaurant();
  const { isOffline } = useNetworkStatus();
  const { customers } = useCustomers();
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [menuSearchTerm, setMenuSearchTerm] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const { menuItems } = useInternalMenuItems(isOpen);

  // Reset state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setSelectedCustomer(null);
      setCustomerSearch("");
      setCart([]);
      setMenuSearchTerm("");
    }
  }, [isOpen]);

  const filteredCustomers = useMemo(() => {
    if (!customerSearch.trim()) return [];
    const term = customerSearch.toLowerCase();
    return customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(term) ||
        (customer.phone && customer.phone.includes(term)) ||
        (customer.email && customer.email.toLowerCase().includes(term))
    ).slice(0, 5);
  }, [customers, customerSearch]);

  const filteredMenuItems = useMemo(() => {
    if (!menuSearchTerm.trim()) return menuItems;
    const term = menuSearchTerm.toLowerCase();
    return menuItems.filter(
      (item) =>
        item.name.toLowerCase().includes(term) ||
        (item.description && item.description.toLowerCase().includes(term))
    );
  }, [menuItems, menuSearchTerm]);

  const selectCustomer = (customer: any) => {
    setSelectedCustomer(customer);
    setCustomerSearch("");
  };

  const addToCart = (item: typeof menuItems[0]) => {
    requestAdd(item as any);
    setMenuSearchTerm("");
  };

  const { requestAdd, pickerNode } = useMenuItemOptionsPicker((item, result) => {
    setCart((prev) => {
      const existing = prev.find(i => i.id === result.cartKey);
      if (existing) {
        return prev.map(i => i.id === result.cartKey ? { ...i, quantity: i.quantity + 1 } : i);
      }
      const displayName = result.optionsLabel ? `${item.name} (${result.optionsLabel})` : item.name;
      return [...prev, {
        id: result.cartKey,
        name: displayName,
        price: result.unitPrice,
        quantity: 1,
        selected_options: result.selectedOptions,
        options_label: result.optionsLabel,
      }];
    });
  });

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
    
    if (!selectedCustomer) {
      toast({
        title: "Client non sélectionné",
        description: "Veuillez sélectionner un client.",
        variant: "destructive",
      });
      return;
    }

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

      // Vérifier s'il y a déjà une session pour cette table
      let sessionQuery = supabase
        .from('table_sessions')
        .select('id')
        .eq('user_id', user.id)
        .eq('table_number', tableNumber)
        .eq('status', 'active') as any;
      if (outletId) {
        sessionQuery = sessionQuery.eq('outlet_id', outletId);
      }
      const { data: existingSession } = await sessionQuery.maybeSingle();

      const sessionId = existingSession?.id;

      // Créer la commande avec les items
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
          session_id: sessionId || null,
          table_number: tableNumber,
          order_type: "sur_place",
          customer_name: selectedCustomer.name,
          customer_phone: selectedCustomer.phone,
          customer_email: selectedCustomer.email,
          items: orderItems,
          total_amount: totalAmount,
          status: "pending",
        },
      ]);

      if (orderError) throw orderError;

      // Mettre à jour le client
      await supabase
        .from("customers")
        .update({
          total_visits: (selectedCustomer.total_visits || 0) + 1,
          total_spent: (selectedCustomer.total_spent || 0) + totalAmount,
          last_visit: new Date().toISOString().split('T')[0],
        })
        .eq("id", selectedCustomer.id);

      toast({
        title: "Commande créée",
        description: `Commande pour ${selectedCustomer.name} ajoutée à la Table ${tableNumber}.`,
      });

      setSelectedCustomer(null);
      setCart([]);
      setCustomerSearch("");
      setMenuSearchTerm("");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error creating order:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la commande.",
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
          <DialogTitle>Ajouter une commande - Table {tableNumber}</DialogTitle>
          <DialogDescription>
            Recherchez un client existant et ajoutez les plats commandés.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="space-y-4 pb-4">
            {/* Recherche de client */}
            {!selectedCustomer ? (
              <div className="space-y-2">
                <Label htmlFor="customer-search">Rechercher un client *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="customer-search"
                    placeholder="Nom, téléphone ou email..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {customerSearch && filteredCustomers.length > 0 && (
                  <ScrollArea className="h-40 border rounded-md">
                    <div className="p-2 space-y-1">
                      {filteredCustomers.map((customer) => (
                        <button
                          key={customer.id}
                          type="button"
                          onClick={() => selectCustomer(customer)}
                          className="w-full text-left p-3 hover:bg-accent rounded-md text-sm"
                        >
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {customer.phone} • {customer.total_visits || 0} visites
                          </div>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                )}
                {customerSearch && filteredCustomers.length === 0 && (
                  <p className="text-sm text-muted-foreground">Aucun client trouvé</p>
                )}
              </div>
            ) : (
              <div className="p-3 bg-primary/10 rounded-md flex justify-between items-center">
                <div>
                  <div className="font-medium">{selectedCustomer.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {selectedCustomer.phone} • {selectedCustomer.total_visits || 0} visites
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedCustomer(null)}
                >
                  Changer
                </Button>
              </div>
            )}

            <Separator />

            {/* Recherche de plats */}
            {selectedCustomer && (
              <div className="space-y-2">
                <Label htmlFor="menu-search">Rechercher un plat</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="menu-search"
                    placeholder="Nom du plat..."
                    value={menuSearchTerm}
                    onChange={(e) => setMenuSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {filteredMenuItems.length > 0 && (
                  <ScrollArea className="h-32 border rounded-md">
                    <div className="p-2 space-y-1">
                      {filteredMenuItems.slice(0, 10).map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => addToCart(item)}
                          className="w-full text-left p-2 hover:bg-accent rounded-md text-sm flex justify-between items-center"
                        >
                          <span>{item.name}</span>
                          <span className="text-muted-foreground">
                            {item.price.toLocaleString()} XAF
                          </span>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                )}
                {filteredMenuItems.length === 0 && menuItems.length > 0 && menuSearchTerm.trim() && (
                  <p className="text-sm text-muted-foreground">Aucun plat trouvé</p>
                )}
              </div>
            )}
          </div>

          {/* Panier */}
          {selectedCustomer && (
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
                            {item.price.toLocaleString()} XAF × {item.quantity} ={" "}
                            {(item.price * item.quantity).toLocaleString()} XAF
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
                    <span>{totalAmount.toLocaleString()} XAF</span>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading || !selectedCustomer || cart.length === 0}>
              {loading ? "Création..." : "Créer la commande"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
