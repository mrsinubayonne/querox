import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Plus, Minus, Search, X, WifiOff, ShoppingCart, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useInternalMenuItems } from "@/hooks/useInternalMenuItems";
import { useAuth } from "@/contexts/AuthContext";
import { useRestaurant } from "@/contexts/RestaurantContext";
import { supabase } from "@/integrations/supabase/client";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { queueMutation, generateLocalId, storeData, getData } from "@/lib/offlineStorage";
import { Badge } from "@/components/ui/badge";
import { useQueryClient } from "@tanstack/react-query";
import { useMenuItemOptionsPicker } from "@/components/menu-management/useMenuItemOptionsPicker";
import type { SelectedOption } from "@/types/menu";

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
  selected_options?: SelectedOption[];
  options_label?: string;
}

export const CreateSessionWithOrderModal: React.FC<CreateSessionWithOrderModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  tableNumber,
}) => {
  const { user, isTeamMember, teamMemberSession } = useAuth();
  const { isOffline } = useNetworkStatus();
  const queryClient = useQueryClient();
  const [numberOfGuests, setNumberOfGuests] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("__all__");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCustomItem, setShowCustomItem] = useState(false);
  const [customItemName, setCustomItemName] = useState("");
  const [customItemPrice, setCustomItemPrice] = useState("");

  const { menuItems, loading: menuLoading } = useInternalMenuItems(isOpen);

  // CRITICAL: Use the EXACT same userId/outletId logic as useOptimizedTableSessions
  // to ensure cache keys match perfectly
  const resolvedUserId = isTeamMember ? (teamMemberSession?.ownerId || '') : (user?.id || '');
  const scopedOutletId = (localStorage.getItem('selectedOutletId') || undefined) as string | undefined;
  const sessionsQueryKey = ['table-sessions', resolvedUserId, scopedOutletId] as const;
  const ordersQueryKey = ['orders', resolvedUserId, scopedOutletId] as const;

  // Reset cart when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setCart([]);
      setSearchTerm("");
      setNumberOfGuests("");
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
      toast.error("Champs requis", { description: "Veuillez renseigner le nom et le prix de l'article." });
      return;
    }

    const price = Number(customItemPrice);
    if (isNaN(price) || price <= 0) {
      toast.error("Prix invalide", { description: "Le prix doit être un nombre positif." });
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
    
    toast.success("Article ajouté", { description: `${customItemName} ajouté au panier.` });
  };

  const totalAmount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (cart.length === 0) {
      toast.error("Panier vide", { description: "Veuillez ajouter au moins un plat à la commande." });
      return;
    }

    setLoading(true);
    try {
      if (!user) throw new Error("Non authentifié");

      const guestCount = parseInt(numberOfGuests) || 1;

      const orderItems = cart.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        selected_options: item.selected_options || [],
      }));

      if (isOffline) {
        const sessionId = generateLocalId();
        const orderId = generateLocalId();
        const nowIso = new Date().toISOString();

        // Queue session creation
        await queueMutation({
          table: 'table_sessions',
          operation: 'insert',
          data: {
            id: sessionId,
            user_id: resolvedUserId,
            outlet_id: scopedOutletId || null,
            table_number: tableNumber,
            number_of_guests: guestCount,
            status: 'active',
            total_amount: totalAmount,
            started_at: nowIso,
            created_at: nowIso,
            updated_at: nowIso,
          },
          localId: sessionId,
          userId: user.id,
          outletId: scopedOutletId,
          maxRetries: 3,
          conflictResolution: 'client-wins',
        });

        // Queue order creation
        await queueMutation({
          table: 'orders',
          operation: 'insert',
          data: {
            id: orderId,
            user_id: resolvedUserId,
            outlet_id: scopedOutletId || null,
            session_id: sessionId,
            table_number: tableNumber,
            order_type: 'sur_place',
            customer_name: `Table ${tableNumber}`,
            items: orderItems,
            total_amount: totalAmount,
            status: 'pending',
            created_at: nowIso,
            updated_at: nowIso,
          },
          localId: orderId,
          userId: user.id,
          outletId: scopedOutletId,
          maxRetries: 3,
          conflictResolution: 'client-wins',
        });

        // Update caches using the SAME keys as the hook
        const newSession = {
          id: sessionId,
          user_id: resolvedUserId,
          outlet_id: scopedOutletId || null,
          debtor_id: null,
          table_number: tableNumber,
          custom_table_name: null,
          status: 'active' as const,
          started_at: nowIso,
          closed_at: null,
          number_of_guests: guestCount,
          total_amount: totalAmount,
          notes: null,
          created_at: nowIso,
          updated_at: nowIso,
        };
        const cachedSessionsScoped = await getData<any[]>('table_sessions', resolvedUserId, scopedOutletId);
        const cachedSessionsFallback = !cachedSessionsScoped?.data && scopedOutletId
          ? await getData<any[]>('table_sessions', resolvedUserId)
          : cachedSessionsScoped;
        const currentSessions =
          (queryClient.getQueryData(sessionsQueryKey) as any[] | undefined) ||
          (cachedSessionsFallback?.data as any[] | undefined) ||
          (cachedSessionsScoped?.data as any[] | undefined) ||
          [];
        const nextSessions = [newSession, ...currentSessions.filter((s: any) => s.id !== newSession.id)];
        queryClient.setQueryData(sessionsQueryKey, nextSessions);
        await storeData('table_sessions', nextSessions as any, resolvedUserId, scopedOutletId);

        const newOrder = {
          id: orderId,
          user_id: resolvedUserId,
          outlet_id: scopedOutletId || null,
          session_id: sessionId,
          table_number: tableNumber,
          order_type: 'sur_place',
          customer_name: `Table ${tableNumber}`,
          items: orderItems,
          total_amount: totalAmount,
          status: 'pending',
          created_at: nowIso,
          updated_at: nowIso,
        };
        const currentOrders = (queryClient.getQueryData(ordersQueryKey) as any[] | undefined) || [];
        queryClient.setQueryData(ordersQueryKey, [newOrder, ...currentOrders]);
        await storeData('orders', [newOrder, ...currentOrders] as any, resolvedUserId, scopedOutletId);

        toast.success("Session créée (hors ligne)", { description: `Table ${tableNumber} ouverte avec ${cart.length} plat(s). Sera synchronisée.` });

        setNumberOfGuests("");
        setCart([]);
        setSearchTerm("");
        onSuccess();
        onClose();
        return;
      }

      // ===== ONLINE MODE =====
      // Step 1: Optimistic update using the EXACT same cache key as the hook
      const nowIso = new Date().toISOString();
      const tempSessionId = `temp-${Date.now()}`;

      const optimisticSession = {
        id: tempSessionId,
        user_id: resolvedUserId,
        outlet_id: scopedOutletId || null,
        debtor_id: null,
        table_number: tableNumber,
        custom_table_name: null,
        status: 'active' as const,
        started_at: nowIso,
        closed_at: null,
        number_of_guests: guestCount,
        total_amount: totalAmount,
        notes: null,
        payment_method: null,
        created_at: nowIso,
        updated_at: nowIso,
      };

      const currentSessions = (queryClient.getQueryData(sessionsQueryKey) as any[] | undefined) || [];
      queryClient.setQueryData(sessionsQueryKey, [optimisticSession, ...currentSessions]);

      try {
        if (!resolvedUserId || !scopedOutletId) {
          throw new Error("Point de vente non sélectionné");
        }

        // Step 2: Ensure the Edge Function receives a fresh JWT, even after long cashier sessions.
        let { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session?.access_token) {
          const refreshed = await supabase.auth.refreshSession();
          sessionData = refreshed.data;
        }

        const accessToken = sessionData.session?.access_token;
        if (!accessToken) {
          throw new Error("Session expirée. Reconnectez-vous pour ouvrir une table.");
        }

        const creationPayload = {
          _owner_id: resolvedUserId,
          _outlet_id: scopedOutletId,
          _table_number: tableNumber,
          _number_of_guests: guestCount,
          _items: orderItems,
          _total_amount: totalAmount,
        };

        // Step 3: Create session + first order atomically through the server audit wrapper.
        let { data: sessionResponse, error: sessionError } = await supabase.functions.invoke(
          "create-table-session-with-order",
          {
            headers: { Authorization: `Bearer ${accessToken}` },
            body: creationPayload,
          }
        );

        if (sessionError) {
          console.warn("Edge session creation failed, falling back to RPC:", sessionError);
          const fallback = await supabase.rpc("create_table_session_with_order", creationPayload as any);
          sessionResponse = fallback.error
            ? { success: false, error: fallback.error.message }
            : { success: true, session: fallback.data };
          sessionError = null;
        }

        if (sessionError) throw sessionError;
        if (!sessionResponse?.success) {
          throw new Error(sessionResponse?.error || "Session non créée");
        }

        const session = sessionResponse.session;
        if (!session?.id) throw new Error("Session non créée");

        // Step 4: Replace temp ID with real ID in cache
        const sessionsAfterInsert = ((queryClient.getQueryData(sessionsQueryKey) as any[] | undefined) || [])
          .map((s: any) => (s.id === tempSessionId ? { ...optimisticSession, ...session } : s));
        queryClient.setQueryData(sessionsQueryKey, sessionsAfterInsert);
        await storeData('table_sessions', sessionsAfterInsert as any, resolvedUserId, scopedOutletId);

        // Step 5: Update orders cache (DB insert was already done by the RPC)
        const orderObj = {
          id: `order-${Date.now()}`,
          user_id: resolvedUserId,
          outlet_id: scopedOutletId,
          session_id: session.id,
          table_number: tableNumber,
          order_type: 'sur_place',
          customer_name: `Table ${tableNumber}`,
          items: orderItems,
          total_amount: totalAmount,
          status: 'pending',
          created_at: nowIso,
          updated_at: nowIso,
        };
        const currentOrders = (queryClient.getQueryData(ordersQueryKey) as any[] | undefined) || [];
        queryClient.setQueryData(ordersQueryKey, [orderObj, ...currentOrders]);

        toast.success("Session créée", { description: `Table ${tableNumber} ouverte avec ${cart.length} plat(s).` });

        setNumberOfGuests("");
        setCart([]);
        setSearchTerm("");
        onSuccess();
        onClose();
      } catch (onlineError) {
        console.error("Error creating session with order (online):", onlineError);
        // Rollback optimistic update
        queryClient.setQueryData(sessionsQueryKey, (prev: any[] = []) => prev.filter((s) => s.id !== tempSessionId));
        throw onlineError;
      }
    } catch (error: any) {
      console.error("Error creating session with order:", error);
      toast.error("Erreur", { description: error?.message || "Impossible de créer la session." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col overflow-hidden p-0">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex-shrink-0 border-b bg-background">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-lg font-semibold">Ouvrir la Table {tableNumber}</DialogTitle>
                {isOffline && (
                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30">
                    <WifiOff className="h-3 w-3 mr-1" />
                    Hors ligne
                  </Badge>
                )}
              </div>
              <DialogDescription className="text-sm mt-1">
                Ajoutez les plats commandés
              </DialogDescription>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
                Annuler
              </Button>
              <Button 
                type="submit" 
                size="lg"
                disabled={loading || cart.length === 0}
                onClick={handleSubmit}
                className="min-w-[180px] text-base font-semibold animate-pulse hover:animate-none shadow-lg"
              >
                {loading ? "Ouverture..." : `Ouvrir & Commander${cart.length > 0 ? ` (${totalAmount.toLocaleString()})` : ""}`}
              </Button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 md:gap-6 flex-1 overflow-hidden px-6">
          {/* LEFT - Search */}
          <div className="flex-1 space-y-4 overflow-y-auto pr-2 md:pr-4 min-h-0">
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
                <ScrollArea className="h-36 md:h-48 border rounded-md">
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
                          {item.price.toLocaleString()} XAF
                        </span>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              )}
              {filteredItems.length === 0 && menuItems.length > 0 && searchTerm.trim() && (
                <p className="text-sm text-muted-foreground">Aucun plat trouvé</p>
              )}
            </div>
          </div>

          {/* RIGHT - Cart */}
          <div className="w-full md:w-[400px] flex flex-col border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6 min-h-0">
            <div className="flex items-center justify-between mb-3">
              <Label className="text-base font-semibold">Panier ({cart.length})</Label>
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
            
            <ScrollArea className="h-32 md:h-[300px] border rounded-md bg-muted/20 mb-4 flex-1 min-h-0">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-8 px-4">
                  <p className="text-center">Aucun plat ajouté</p>
                  <p className="text-sm text-center mt-2">Recherchez et ajoutez des plats</p>
                </div>
              ) : (
                <div className="space-y-2 p-3">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 md:p-3 bg-background border rounded-md shadow-sm"
                    >
                      <div className="flex-1 min-w-0 pr-2 md:pr-3">
                        <p className="font-medium truncate text-sm md:text-base">{item.name}</p>
                        <p className="text-xs md:text-sm text-muted-foreground">
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
              <div className="mb-4 p-3 md:p-4 bg-primary/10 border border-primary/20 rounded-md flex-shrink-0">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-base md:text-lg">Total</span>
                  <span className="font-bold text-lg md:text-xl text-primary">{totalAmount.toLocaleString()} XAF</span>
                </div>
              </div>
            )}
          </div>
        </form>
        {pickerNode}
      </DialogContent>
    </Dialog>
  );
};
