import React, { useMemo, useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, Search, X, WifiOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRestaurant } from "@/contexts/RestaurantContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { queueMutation, generateLocalId, storeData, getData } from "@/lib/offlineStorage";
import { useQueryClient } from "@tanstack/react-query";
import { useInternalMenuItems } from "@/hooks/useInternalMenuItems";
import type { MenuItem, SelectedOption } from "@/types/menu";
import { useMenuItemOptionsPicker } from "@/components/menu-management/useMenuItemOptionsPicker";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  sessionId: string;
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

const QuickAddOrderToSessionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccess,
  sessionId,
  tableNumber,
}) => {
  const { user, isTeamMember, teamMemberSession } = useAuth();
  const { toast } = useToast();
  const { outletId } = useRestaurant();
  const { isOffline } = useNetworkStatus();
  const queryClient = useQueryClient();
  const resolvedUserId = isTeamMember ? (teamMemberSession?.ownerId || user?.id || '') : (user?.id || '');
  const scopedOutletId = (localStorage.getItem('selectedOutletId') || outletId || undefined) as string | undefined;
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCustomItem, setShowCustomItem] = useState(false);
  const [customItemName, setCustomItemName] = useState("");
  const [customItemPrice, setCustomItemPrice] = useState("");

  const { menuItems } = useInternalMenuItems(isOpen);

  // Reset cart when modal opens
  useEffect(() => {
    if (isOpen) {
      setCart([]);
      setSearchTerm("");
    }
  }, [isOpen]);

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
    
    if (itemData && (itemData as any).is_custom_price) {
      const customPrice = prompt("Entrez le prix pour ce plat:");
      const customName = (itemData as any).is_custom_name 
        ? prompt("Entrez le nom du plat:", item.name) 
        : item.name;
      
      if (!customPrice || isNaN(Number(customPrice))) return;
      
      setCart((prev) => [
        ...prev, 
        { 
          id: item.id + Date.now(),
          name: customName || item.name, 
          price: Number(customPrice), 
          quantity: 1 
        }
      ]);
      setSearchTerm("");
      return;
    }
    requestAdd(item as any);
    setSearchTerm("");
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

  const totalAmount = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);

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

      const orderItems = cart.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        selected_options: item.selected_options || [],
      }));

      if (isOffline) {
        const orderId = generateLocalId();

        const resolvedOutletId = scopedOutletId || localStorage.getItem("selectedOutletId");
        if (!resolvedOutletId) {
          toast({
            title: "Erreur",
            description: "Aucun point de vente sélectionné.",
            variant: "destructive",
          });
          return;
        }

        const outletKey = resolvedOutletId || undefined;
        const ordersKey = ["orders", resolvedUserId, outletKey] as const;
        const sessionsKey = ["table-sessions", resolvedUserId, outletKey] as const;

        await queueMutation({
          table: 'orders',
          operation: 'insert',
          data: {
            id: orderId,
            user_id: resolvedUserId,
            outlet_id: resolvedOutletId,
            session_id: sessionId,
            table_number: tableNumber,
            order_type: 'sur_place',
            customer_name: `Table ${tableNumber}`,
            items: orderItems,
            total_amount: totalAmount,
            status: 'pending',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          localId: orderId,
          userId: resolvedUserId,
          outletId: outletKey,
          maxRetries: 3,
          conflictResolution: 'client-wins',
        });

        const currentOrders = (queryClient.getQueryData(ordersKey) as any[] | undefined) || [];
        const nextOrders = [
          {
            id: orderId,
            user_id: resolvedUserId,
            outlet_id: resolvedOutletId,
            session_id: sessionId,
            table_number: tableNumber,
            order_type: 'sur_place',
            customer_name: `Table ${tableNumber}`,
            items: orderItems,
            total_amount: totalAmount,
            status: 'pending',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          ...currentOrders,
        ];
        queryClient.setQueryData(ordersKey, nextOrders);
        await storeData('orders', nextOrders as any, resolvedUserId, outletKey);

        const cachedSessionsScoped = await getData<any[]>('table_sessions', resolvedUserId, outletKey);
        const cachedSessionsFallback = !cachedSessionsScoped?.data && outletKey
          ? await getData<any[]>('table_sessions', resolvedUserId)
          : cachedSessionsScoped;
        const currentSessions =
          (queryClient.getQueryData(sessionsKey) as any[] | undefined) ||
          (cachedSessionsFallback?.data as any[] | undefined) ||
          (cachedSessionsScoped?.data as any[] | undefined) ||
          [];
        const nextSessions = currentSessions.some((s: any) => s.id === sessionId)
          ? currentSessions.map((s: any) =>
              s.id === sessionId
                ? {
                    ...s,
                    total_amount: Number(s.total_amount || 0) + Number(totalAmount || 0),
                    updated_at: new Date().toISOString(),
                  }
                : s
            )
          : currentSessions;

        if (nextSessions.length > 0) {
          queryClient.setQueryData(sessionsKey, nextSessions);
          await storeData('table_sessions', nextSessions as any, resolvedUserId, outletKey);
        }

        toast({
          title: "Commande ajoutée (hors ligne)",
          description: `${cart.length} plat(s) ajoutés. Sera synchronisée.`,
        });

        window.dispatchEvent(new CustomEvent("session-updated"));
        setCart([]);
        setSearchTerm("");
        onSuccess?.();
        onClose();
        return;
      }

      // Online mode
      const resolvedOutletId = scopedOutletId || localStorage.getItem('selectedOutletId');

      const { error } = await supabase.from("orders").insert([
        {
          user_id: resolvedUserId,
          outlet_id: resolvedOutletId,
          session_id: sessionId,
          table_number: tableNumber,
          order_type: "sur_place",
          customer_name: `Table ${tableNumber}`,
          items: orderItems as any,
          total_amount: totalAmount,
          status: "pending",
        },
      ]);

      if (error) throw error;

      toast({
        title: "Commande ajoutée",
        description: `${cart.length} plat(s) ajoutés à la session.`,
      });

      window.dispatchEvent(new CustomEvent("session-updated"));
      setCart([]);
      setSearchTerm("");
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error("Error adding order:", err);
      toast({ title: "Erreur", description: "Impossible d'ajouter la commande.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>Ajouter une commande</DialogTitle>
            {isOffline && (
              <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30">
                <WifiOff className="h-3 w-3 mr-1" />
                Hors ligne
              </Badge>
            )}
          </div>
          <DialogDescription>
            Recherchez et ajoutez des plats pour la Table {tableNumber}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="space-y-4 pb-4">
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
                  autoFocus
                />
              </div>
              {filteredItems.length > 0 && (
                <ScrollArea className="h-48 border rounded-md">
                  <div className="p-2 space-y-1">
                    {filteredItems.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => addToCart(item)}
                        className="w-full text-left p-3 hover:bg-accent rounded-md flex justify-between items-center"
                      >
                        <div>
                          <p className="font-medium">{item.name}</p>
                          {item.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
                          )}
                        </div>
                        <span className="text-muted-foreground font-medium ml-4">
                          {item.price.toLocaleString()} XAF
                        </span>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              )}
              {filteredItems.length === 0 && menuItems.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  {isOffline ? "Aucun plat en cache. Connectez-vous pour charger le menu." : "Aucun plat trouvé"}
                </p>
              )}
              {filteredItems.length === 0 && menuItems.length > 0 && searchTerm && (
                <p className="text-sm text-muted-foreground">Aucun plat trouvé pour "{searchTerm}"</p>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col border-t pt-4">
            <div className="flex items-center justify-between mb-2">
              <Label>Plats commandés ({cart.length})</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowCustomItem(!showCustomItem)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Article libre
              </Button>
            </div>

            {/* Custom item form */}
            {showCustomItem && (
              <div className="space-y-3 p-3 mb-3 border rounded-md bg-accent/10">
                <div className="space-y-2">
                  <Label htmlFor="custom-name">Nom de l'article *</Label>
                  <Input
                    id="custom-name"
                    placeholder="Ex: Plat du jour"
                    value={customItemName}
                    onChange={(e) => setCustomItemName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="custom-price">Prix (XAF) *</Label>
                  <Input
                    id="custom-price"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="Ex: 5000"
                    value={customItemPrice}
                    onChange={(e) => setCustomItemPrice(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="button" size="sm" onClick={addCustomItem} className="flex-1">
                    Ajouter
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => {
                    setShowCustomItem(false);
                    setCustomItemName("");
                    setCustomItemPrice("");
                  }}>
                    Annuler
                  </Button>
                </div>
              </div>
            )}

            <ScrollArea className="flex-1">
              {cart.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  Recherchez et ajoutez des plats à la commande
                </div>
              ) : (
                <div className="space-y-2 pr-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-accent/50 rounded-md">
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.price.toLocaleString()} XAF × {item.quantity} = {(item.price * item.quantity).toLocaleString()} XAF
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.id, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.id, 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          <DialogFooter className="pt-4 border-t mt-4">
            <div className="flex items-center justify-between w-full">
              <div className="text-sm font-medium">
                Total : <span className="text-lg font-bold">{totalAmount.toLocaleString()} XAF</span>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Annuler
                </Button>
                <Button type="submit" disabled={loading || cart.length === 0}>
                  {loading ? "Envoi..." : `Confirmer (${cart.length} plat${cart.length > 1 ? "s" : ""})`}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </form>
        {pickerNode}
      </DialogContent>
    </Dialog>
  );
};

export default QuickAddOrderToSessionModal;
