import React, { useState, useMemo, useEffect } from "react";
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
import { Plus, Minus, Search, X } from "lucide-react";
import { useMenuData } from "@/hooks/useMenuData";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { queueMutation, getData, storeData } from "@/lib/offlineStorage";
import { getSelectedOutletIdFromStorage, resolveOfflineUserId } from "@/lib/offlineIdentity";

interface EditOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  orderId: string | null;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export const EditOrderModal: React.FC<EditOrderModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  orderId,
}) => {
  const { user, isTeamMember, teamMemberSession } = useAuth();
  const { toast } = useToast();
  const { isOffline } = useNetworkStatus();
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const fetchOrderAndMenu = async () => {
      if (!user || !orderId || !isOpen) return;

      setInitialLoading(true);
      try {
        const resolvedUserId = resolveOfflineUserId({
          userId: user.id,
          isTeamMember,
          ownerId: teamMemberSession?.ownerId,
        });
        const outletId = getSelectedOutletIdFromStorage();

        if (isOffline) {
          // Load order from IndexedDB
          const cachedOrders = (await getData<any[]>('orders', resolvedUserId, outletId)) ??
                               (resolvedUserId ? await getData<any[]>('orders', resolvedUserId) : undefined);
          const order = (cachedOrders?.data || []).find((o: any) => o.id === orderId);
          if (order && Array.isArray(order.items)) {
            setCart(order.items as unknown as CartItem[]);
          }
          // Load active menu id from localStorage (set by useInternalMenuItems)
          const cachedMenuId = localStorage.getItem('activeMenuId');
          if (cachedMenuId) setActiveMenuId(cachedMenuId);
        } else {
          // Online path
          const { data: order, error: orderError } = await supabase
            .from("orders")
            .select("*")
            .eq("id", orderId)
            .single();

          if (orderError) throw orderError;

          const { data: profile } = await supabase
            .from("profiles")
            .select("selected_outlet_id")
            .eq("id", user.id)
            .maybeSingle();

          const profileOutletId = profile?.selected_outlet_id || outletId;

          const { data: menus } = await supabase
            .from("menus")
            .select("id")
            .eq("user_id", user.id)
            .eq("is_active", true)
            .eq("outlet_id", profileOutletId)
            .limit(1)
            .maybeSingle();

          if (menus) setActiveMenuId(menus.id);

          if (order && Array.isArray(order.items)) {
            setCart(order.items as unknown as CartItem[]);
          }
        }
      } catch (error) {
        console.error("Error loading order:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger la commande.",
          variant: "destructive",
        });
      } finally {
        setInitialLoading(false);
      }
    };

    if (isOpen && orderId) {
      fetchOrderAndMenu();
    } else {
      setCart([]);
      setSearchTerm("");
    }
  }, [user, isOpen, orderId]);

  const { menuItems } = useMenuData(activeMenuId);

  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return [];
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
        description: "La commande doit contenir au moins un plat.",
        variant: "destructive",
      });
      return;
    }

    if (!orderId) return;

    setLoading(true);
    try {
      const orderItems = cart.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      }));

      const updatePayload = { items: orderItems, total_amount: totalAmount };

      if (isOffline) {
        const resolvedUserId = resolveOfflineUserId({
          userId: user?.id,
          isTeamMember,
          ownerId: teamMemberSession?.ownerId,
        });
        const outletId = getSelectedOutletIdFromStorage();
        if (!resolvedUserId) throw new Error("Session introuvable");

        // Queue the update for sync when back online
        await queueMutation({
          table: 'orders',
          operation: 'update',
          data: { id: orderId, ...updatePayload },
          localId: orderId,
          userId: resolvedUserId,
          outletId,
          maxRetries: 3,
          conflictResolution: 'client-wins',
        });

        // Optimistically update local IndexedDB cache
        const cached = (await getData<any[]>('orders', resolvedUserId, outletId)) ??
                       (outletId ? await getData<any[]>('orders', resolvedUserId) : undefined);
        if (cached?.data) {
          const updated = cached.data.map((o: any) =>
            o.id === orderId ? { ...o, ...updatePayload, updated_at: new Date().toISOString() } : o
          );
          await storeData('orders', updated, resolvedUserId, outletId);
        }

        toast({
          title: "Commande modifiée (hors-ligne)",
          description: "Sera synchronisée à la reconnexion.",
        });
      } else {
        const { error: updateError } = await supabase
          .from("orders")
          .update(updatePayload)
          .eq("id", orderId);

        if (updateError) throw updateError;

        // Mettre à jour le total de la session si nécessaire
        const { data: order } = await supabase
          .from("orders")
          .select("session_id")
          .eq("id", orderId)
          .single();

        if (order?.session_id) {
          const { data: sessionOrders } = await supabase
            .from("orders")
            .select("total_amount")
            .eq("session_id", order.session_id);

          if (sessionOrders) {
            const sessionTotal = sessionOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
            await supabase
              .from("table_sessions")
              .update({ total_amount: sessionTotal })
              .eq("id", order.session_id);
          }
        }

        toast({
          title: "Commande modifiée",
          description: "La commande a été mise à jour avec succès.",
        });
      }

      window.dispatchEvent(new CustomEvent("session-updated"));
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error updating order:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de modifier la commande.",
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
          <DialogTitle>Modifier la Commande</DialogTitle>
          <DialogDescription>
            Modifiez les plats et quantités de cette commande.
          </DialogDescription>
        </DialogHeader>

        {initialLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Chargement de la commande...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="space-y-4 pb-4">
              {/* Recherche de plats */}
              <div className="space-y-2">
                <Label htmlFor="search">Ajouter un plat</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Rechercher un plat..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {searchTerm && filteredItems.length > 0 && (
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
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {item.description}
                              </p>
                            )}
                          </div>
                          <span className="text-muted-foreground font-medium ml-4">
                            {item.price.toLocaleString()} FCFA
                          </span>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            </div>

            {/* Panier */}
            <div className="flex-1 overflow-hidden flex flex-col border-t pt-4">
              <Label className="mb-2">Plats commandés ({cart.length})</Label>
              <ScrollArea className="flex-1">
                {cart.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    La commande est vide
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
                {loading ? "Modification..." : "Enregistrer"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
