import React, { useState, useMemo, useDeferredValue, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, WifiOff, ShoppingCart, Loader2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useInternalMenuItems } from "@/hooks/useInternalMenuItems";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { queueMutation, generateLocalId, storeData, getData } from "@/lib/offlineStorage";
import { Badge } from "@/components/ui/badge";
import { useQueryClient } from "@tanstack/react-query";
import { useMenuItemOptionsPicker } from "@/components/menu-management/useMenuItemOptionsPicker";
import type { SelectedOption } from "@/types/menu";
import { PosNumpad, type NumpadMode } from "@/components/tables/pos/PosNumpad";
import { PosProductTile, colorForCategory } from "@/components/tables/pos/PosProductTile";

interface CreateSessionWithOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tableNumber: string;
  onQuickInvoice?: (sessionId: string) => Promise<void> | void;
}

interface CartItem {
  id: string;
  name: string;
  price: number; // unit price after manual override
  quantity: number;
  discount?: number; // %
  selected_options?: SelectedOption[];
  options_label?: string;
}

export const CreateSessionWithOrderModal: React.FC<CreateSessionWithOrderModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  tableNumber,
  onQuickInvoice,
}) => {
  const { user, isTeamMember, teamMemberSession } = useAuth();
  const { isOffline } = useNetworkStatus();
  const queryClient = useQueryClient();
  const [numberOfGuests, setNumberOfGuests] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearch = useDeferredValue(searchTerm);
  const [activeCategory, setActiveCategory] = useState<string>("__all__");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCustomItem, setShowCustomItem] = useState(false);
  const [customItemName, setCustomItemName] = useState("");
  const [customItemPrice, setCustomItemPrice] = useState("");

  // POS numpad state
  const [activeLineId, setActiveLineId] = useState<string | null>(null);
  const [numpadMode, setNumpadMode] = useState<NumpadMode>('qty');
  const [numpadBuffer, setNumpadBuffer] = useState<string>('');

  const { menuItems, loading: menuLoading } = useInternalMenuItems(true);

  const resolvedUserId = isTeamMember ? (teamMemberSession?.ownerId || '') : (user?.id || '');
  const scopedOutletId = (localStorage.getItem('selectedOutletId') || undefined) as string | undefined;
  const sessionsQueryKey = ['table-sessions', resolvedUserId, scopedOutletId] as const;
  const ordersQueryKey = ['orders', resolvedUserId, scopedOutletId] as const;

  // Reset state on close (not on open) -> opening is instant
  React.useEffect(() => {
    if (!isOpen) {
      setCart([]);
      setSearchTerm("");
      setNumberOfGuests("");
      setActiveCategory("__all__");
      setActiveLineId(null);
      setNumpadBuffer('');
      setNumpadMode('qty');
      setShowCustomItem(false);
    }
  }, [isOpen]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    menuItems.forEach((it: any) => set.add(it.category_name || "Autres"));
    return Array.from(set).sort();
  }, [menuItems]);

  const filteredItems = useMemo(() => {
    const term = deferredSearch.trim().toLowerCase();
    return menuItems.filter((item: any) => {
      const matchCat = activeCategory === "__all__" || (item.category_name || "Autres") === activeCategory;
      if (!matchCat) return false;
      if (!term) return true;
      return item.name.toLowerCase().includes(term);
    });
  }, [menuItems, deferredSearch, activeCategory]);

  const totalQty = useMemo(() => cart.reduce((s, i) => s + i.quantity, 0), [cart]);

  // Apply numpad buffer to active line whenever it changes meaningfully
  const applyBufferToLine = useCallback((lineId: string, mode: NumpadMode, raw: string) => {
    const num = Number(raw);
    if (isNaN(num)) return;
    setCart(prev => prev.map(it => {
      if (it.id !== lineId) return it;
      if (mode === 'qty') return { ...it, quantity: Math.max(1, Math.floor(num)) };
      if (mode === 'price') return { ...it, price: Math.max(0, num) };
      if (mode === 'discount') return { ...it, discount: Math.max(0, Math.min(100, num)) };
      return it;
    }));
  }, []);

  React.useEffect(() => {
    if (!activeLineId || numpadBuffer === '') return;
    applyBufferToLine(activeLineId, numpadMode, numpadBuffer);
  }, [numpadBuffer, numpadMode, activeLineId, applyBufferToLine]);

  const removeActiveLine = useCallback(() => {
    if (!activeLineId) return;
    setCart(prev => prev.filter(i => i.id !== activeLineId));
    setActiveLineId(null);
    setNumpadBuffer('');
  }, [activeLineId]);




  const { requestAdd, pickerNode } = useMenuItemOptionsPicker((item, result) => {
    setCart((prev) => {
      const existing = prev.find(i => i.id === result.cartKey);
      let next;
      if (existing) {
        next = prev.map(i => i.id === result.cartKey ? { ...i, quantity: i.quantity + 1 } : i);
      } else {
        const displayName = result.optionsLabel ? `${item.name} (${result.optionsLabel})` : item.name;
        next = [...prev, {
          id: result.cartKey,
          name: displayName,
          price: result.unitPrice,
          quantity: 1,
          selected_options: result.selectedOptions,
          options_label: result.optionsLabel,
        }];
      }
      return next;
    });
    setActiveLineId(result.cartKey);
    setNumpadBuffer('');
    setNumpadMode('qty');
  });

  const addToCart = useCallback((id: string) => {
    const item = menuItems.find(m => m.id === id);
    if (!item) return;
    if ((item as any).is_custom_price) {
      // Open as custom-price line, numpad auto-switches to Prix mode
      const lineId = `custom-${Date.now()}`;
      setCart(prev => [...prev, { id: lineId, name: item.name, price: 0, quantity: 1 }]);
      setActiveLineId(lineId);
      setNumpadMode('price');
      setNumpadBuffer('');
      return;
    }
    requestAdd(item as any);
  }, [menuItems, requestAdd]);

  const selectLine = useCallback((id: string) => {
    setActiveLineId(id);
    setNumpadBuffer('');
  }, []);

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
      price,
      quantity: 1,
    };
    setCart((prev) => [...prev, newItem]);
    setActiveLineId(newItem.id);
    setCustomItemName("");
    setCustomItemPrice("");
    setShowCustomItem(false);
  };

  const lineTotal = (item: CartItem) => {
    const gross = item.price * item.quantity;
    return gross * (1 - (item.discount || 0) / 100);
  };

  const totalAmount = useMemo(() => cart.reduce((s, i) => s + lineTotal(i), 0), [cart]);



  const handleSubmit = async (e: React.FormEvent | null, quickInvoice = false) => {
    if (e) e.preventDefault();
    
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
        if (quickInvoice && onQuickInvoice) {
          try { await onQuickInvoice(sessionId); } catch (err) { console.warn('quick invoice failed', err); }
        }
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
      <DialogContent className="max-w-6xl w-[95vw] h-[90vh] p-0 flex flex-col gap-0 overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b shrink-0 flex items-center justify-between gap-3">
          <DialogTitle className="flex items-center gap-2 text-base">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Ouvrir la Table {tableNumber}
            {isOffline && (
              <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30">
                <WifiOff className="h-3 w-3 mr-1" />
                Hors ligne
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription className="sr-only">Ajoutez les plats commandés</DialogDescription>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min="1"
              placeholder="Couverts"
              value={numberOfGuests}
              onChange={(e) => setNumberOfGuests(e.target.value)}
              className="w-24 h-9"
            />
          </div>
        </div>

        {/* === Onglets catégories horizontaux === */}
        <div className="border-b shrink-0 overflow-x-auto">
          <div className="flex gap-1 px-3 py-2 min-w-max">
            <button
              type="button"
              onClick={() => setActiveCategory("__all__")}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition active:scale-[0.97]",
                activeCategory === "__all__"
                  ? "bg-primary text-primary-foreground shadow"
                  : "bg-muted hover:bg-accent",
              )}
            >
              Toutes <span className="opacity-70">({menuItems.length})</span>
            </button>
            {categories.map((cat) => {
              const count = menuItems.filter((i: any) => (i.category_name || "Autres") === cat).length;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition active:scale-[0.97]",
                    activeCategory === cat
                      ? "bg-primary text-primary-foreground shadow"
                      : "bg-muted hover:bg-accent",
                  )}
                >
                  {cat} <span className="opacity-70">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-[1fr_360px] overflow-hidden">
          {/* === Plats (sans images, tuiles denses) === */}
          <section className="flex flex-col overflow-hidden">
            <div className="p-2 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un plat... (Échap pour vider)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Escape') setSearchTerm(''); }}
                  className="pl-10 h-9"
                  autoComplete="off"
                />
              </div>
            </div>
            <ScrollArea className="flex-1 p-2">
              {menuLoading && menuItems.length === 0 ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" /> Chargement...
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm">Aucun plat trouvé</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1.5">
                  {filteredItems.map((item: any) => (
                    <PosProductTile
                      key={item.id}
                      id={item.id}
                      name={item.name}
                      price={Number(item.price) || 0}
                      accent={colorForCategory(item.category_name || 'Autres')}
                      onClick={addToCart}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </section>

          {/* === Ticket + Numpad === */}
          <aside className="border-l flex flex-col overflow-hidden bg-card">
            <div className="px-3 py-2 border-b flex items-center justify-between gap-2">
              <h3 className="text-xs font-semibold uppercase text-muted-foreground">Ticket ({totalQty})</h3>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  min="1"
                  placeholder="Couv."
                  value={numberOfGuests}
                  onChange={(e) => setNumberOfGuests(e.target.value)}
                  className="w-16 h-7 text-xs"
                />
                <Button type="button" size="sm" variant="ghost" onClick={() => setShowCustomItem(!showCustomItem)} className="h-7 text-xs px-2">
                  <Plus className="h-3 w-3 mr-0.5" /> Libre
                </Button>
                {cart.length > 0 && (
                  <Button type="button" size="sm" variant="ghost" onClick={() => { setCart([]); setActiveLineId(null); }} className="h-7 text-xs px-2">
                    Vider
                  </Button>
                )}
              </div>
            </div>

            {showCustomItem && (
              <div className="space-y-1.5 p-2 border-b bg-accent/10">
                <Input
                  placeholder="Nom de l'article"
                  value={customItemName}
                  onChange={(e) => setCustomItemName(e.target.value)}
                  className="h-8"
                />
                <Input
                  type="number"
                  min="0"
                  placeholder="Prix (XAF)"
                  value={customItemPrice}
                  onChange={(e) => setCustomItemPrice(e.target.value)}
                  className="h-8"
                />
                <div className="flex gap-2">
                  <Button type="button" size="sm" onClick={addCustomItem} className="flex-1 h-8">Ajouter</Button>
                  <Button type="button" size="sm" variant="outline" className="h-8" onClick={() => { setShowCustomItem(false); setCustomItemName(""); setCustomItemPrice(""); }}>
                    Annuler
                  </Button>
                </div>
              </div>
            )}

            <ScrollArea className="flex-1">
              {cart.length === 0 ? (
                <div className="text-center py-10 text-sm text-muted-foreground px-4">
                  Cliquez sur un plat → puis utilisez le pavé numérique
                </div>
              ) : (
                <div className="p-1.5 space-y-1">
                  {cart.map((item) => {
                    const isActive = item.id === activeLineId;
                    const showBuffer = isActive && numpadBuffer !== '';
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => selectLine(item.id)}
                        className={cn(
                          "w-full text-left rounded-md p-2 transition active:scale-[0.99] border",
                          isActive
                            ? "bg-primary/10 border-primary shadow-sm"
                            : "bg-muted/30 border-transparent hover:bg-muted/50",
                        )}
                      >
                        <div className="flex justify-between items-start gap-2 mb-0.5">
                          <p className="text-sm font-medium leading-tight flex-1 min-w-0 line-clamp-1">{item.name}</p>
                          <span className="text-sm font-bold text-primary shrink-0">
                            {Math.round(lineTotal(item)).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>
                            <span className={cn(numpadMode === 'qty' && isActive && "text-primary font-bold")}>
                              {showBuffer && numpadMode === 'qty' ? numpadBuffer : item.quantity}
                            </span>
                            {' × '}
                            <span className={cn(numpadMode === 'price' && isActive && "text-primary font-bold")}>
                              {(showBuffer && numpadMode === 'price' ? Number(numpadBuffer) : item.price).toLocaleString()}
                            </span>
                            {(item.discount || (showBuffer && numpadMode === 'discount')) ? (
                              <span className={cn("ml-1", numpadMode === 'discount' && isActive && "text-primary font-bold")}>
                                {' '}-{showBuffer && numpadMode === 'discount' ? numpadBuffer : item.discount}%
                              </span>
                            ) : null}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </ScrollArea>

            <PosNumpad
              mode={numpadMode}
              onModeChange={(m) => { setNumpadMode(m); setNumpadBuffer(''); }}
              buffer={numpadBuffer}
              onBufferChange={setNumpadBuffer}
              onDeleteLine={removeActiveLine}
              disabled={!activeLineId}
            />

            <div className="p-2 border-t bg-muted/30 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total</span>
                <span className="text-xl font-bold text-primary">{Math.round(totalAmount).toLocaleString()} XAF</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="active:scale-[0.97]">
                  Annuler
                </Button>
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || cart.length === 0}
                  className="active:scale-[0.97]"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ouvrir & Commander"}
                </Button>
              </div>
            </div>
          </aside>
        </div>
        {pickerNode}
      </DialogContent>
    </Dialog>
  );
};
