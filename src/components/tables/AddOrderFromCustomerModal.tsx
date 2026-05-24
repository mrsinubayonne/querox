import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, Search, X, User, ShoppingCart, Loader2 } from "lucide-react";
import { useInternalMenuItems } from "@/hooks/useInternalMenuItems";
import { useCustomers } from "@/hooks/useCustomers";
import { useAuth } from "@/contexts/AuthContext";
import { useRestaurant } from "@/contexts/RestaurantContext";
import { supabase } from "@/integrations/supabase/client";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { useMenuItemOptionsPicker } from "@/components/menu-management/useMenuItemOptionsPicker";
import type { SelectedOption } from "@/types/menu";
import { cn } from "@/lib/utils";

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

const ALL_CATEGORIES = "__all__";

export const AddOrderFromCustomerModal: React.FC<AddOrderFromCustomerModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  tableNumber,
}) => {
  const { user } = useAuth();
  const { isOffline } = useNetworkStatus();
  const { customers } = useCustomers();

  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [menuSearchTerm, setMenuSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>(ALL_CATEGORIES);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const { menuItems, loading: menuLoading } = useInternalMenuItems(isOpen);

  React.useEffect(() => {
    if (isOpen) {
      setSelectedCustomer(null);
      setCustomerSearch("");
      setCart([]);
      setMenuSearchTerm("");
      setActiveCategory(ALL_CATEGORIES);
    }
  }, [isOpen]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    menuItems.forEach((it) => set.add(it.category_name || "Autres"));
    return Array.from(set).sort();
  }, [menuItems]);

  const filteredMenuItems = useMemo(() => {
    const term = menuSearchTerm.trim().toLowerCase();
    return menuItems.filter((item) => {
      const matchCat =
        activeCategory === ALL_CATEGORIES || (item.category_name || "Autres") === activeCategory;
      if (!matchCat) return false;
      if (!term) return true;
      return (
        item.name.toLowerCase().includes(term) ||
        (item.description && item.description.toLowerCase().includes(term))
      );
    });
  }, [menuItems, activeCategory, menuSearchTerm]);

  const filteredCustomers = useMemo(() => {
    if (!customerSearch.trim()) return [];
    const term = customerSearch.toLowerCase();
    return customers
      .filter(
        (c) =>
          c.name.toLowerCase().includes(term) ||
          (c.phone && c.phone.includes(term)) ||
          (c.email && c.email.toLowerCase().includes(term))
      )
      .slice(0, 5);
  }, [customers, customerSearch]);

  const { requestAdd, pickerNode } = useMenuItemOptionsPicker((item, result) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === result.cartKey);
      if (existing) {
        return prev.map((i) =>
          i.id === result.cartKey ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      const displayName = result.optionsLabel ? `${item.name} (${result.optionsLabel})` : item.name;
      return [
        ...prev,
        {
          id: result.cartKey,
          name: displayName,
          price: result.unitPrice,
          quantity: 1,
          selected_options: result.selectedOptions,
          options_label: result.optionsLabel,
        },
      ];
    });
  });

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, quantity: item.quantity + delta } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id: string) =>
    setCart((prev) => prev.filter((item) => item.id !== id));

  const totalAmount = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );
  const totalQty = useMemo(() => cart.reduce((s, i) => s + i.quantity, 0), [cart]);

  const handleSubmit = async () => {
    if (!selectedCustomer) {
      toast.error("Client requis", { description: "Sélectionnez un client avant de valider." });
      return;
    }
    if (cart.length === 0) {
      toast.error("Panier vide", { description: "Ajoutez au moins un plat." });
      return;
    }

    setLoading(true);
    try {
      if (!user) throw new Error("Non authentifié");

      const selectedProfileId = localStorage.getItem("selectedProfileId");
      let outletId: string | null = null;
      if (selectedProfileId) {
        const { data: up } = await supabase
          .from("user_profiles")
          .select("selected_outlet_id")
          .eq("id", selectedProfileId)
          .maybeSingle();
        outletId = (up as any)?.selected_outlet_id ?? null;
      } else {
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("selected_outlet_id")
          .eq("user_id", user.id)
          .maybeSingle();
        outletId = (profile as any)?.selected_outlet_id ?? null;
      }

      let sessionQuery = supabase
        .from("table_sessions")
        .select("id")
        .eq("user_id", user.id)
        .eq("table_number", tableNumber)
        .eq("status", "active") as any;
      if (outletId) sessionQuery = sessionQuery.eq("outlet_id", outletId);
      const { data: existingSession } = await sessionQuery.maybeSingle();
      const sessionId = existingSession?.id;

      const orderItems = cart.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        selected_options: item.selected_options || [],
      })) as any;

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

      await supabase
        .from("customers")
        .update({
          total_visits: (selectedCustomer.total_visits || 0) + 1,
          total_spent: (selectedCustomer.total_spent || 0) + totalAmount,
          last_visit: new Date().toISOString().split("T")[0],
        })
        .eq("id", selectedCustomer.id);

      toast.success("Commande créée", {
        description: `Commande pour ${selectedCustomer.name} ajoutée à la Table ${tableNumber}.`,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error creating order:", err);
      toast.error("Erreur", { description: "Impossible de créer la commande." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-6xl w-[95vw] h-[90vh] p-0 flex flex-col gap-0">
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <DialogTitle className="flex items-center gap-3">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Prise de commande — Table {tableNumber}
            {isOffline && <Badge variant="outline" className="ml-2">Hors ligne</Badge>}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-[180px_1fr_340px] overflow-hidden">
          {/* === Colonne 1 : Catégories === */}
          <aside className="border-r bg-muted/30 overflow-hidden flex flex-col">
            <div className="p-3 border-b">
              <h3 className="text-xs font-semibold uppercase text-muted-foreground">Catégories</h3>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                <button
                  type="button"
                  onClick={() => setActiveCategory(ALL_CATEGORIES)}
                  className={cn(
                    "w-full text-left px-3 py-2.5 rounded-md text-sm font-medium transition-all active:scale-[0.97]",
                    activeCategory === ALL_CATEGORIES
                      ? "bg-primary text-primary-foreground shadow"
                      : "hover:bg-accent"
                  )}
                >
                  Toutes ({menuItems.length})
                </button>
                {categories.map((cat) => {
                  const count = menuItems.filter((i) => (i.category_name || "Autres") === cat).length;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActiveCategory(cat)}
                      className={cn(
                        "w-full text-left px-3 py-2.5 rounded-md text-sm font-medium transition-all active:scale-[0.97]",
                        activeCategory === cat
                          ? "bg-primary text-primary-foreground shadow"
                          : "hover:bg-accent"
                      )}
                    >
                      {cat} <span className="opacity-70">({count})</span>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </aside>

          {/* === Colonne 2 : Plats === */}
          <section className="flex flex-col overflow-hidden">
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un plat..."
                  value={menuSearchTerm}
                  onChange={(e) => setMenuSearchTerm(e.target.value)}
                  className="pl-10 h-10"
                  autoComplete="off"
                />
              </div>
            </div>
            <ScrollArea className="flex-1 p-3">
              {menuLoading && menuItems.length === 0 ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" /> Chargement...
                </div>
              ) : filteredMenuItems.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  Aucun plat trouvé
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {filteredMenuItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => requestAdd(item as any)}
                      className="group relative text-left p-3 rounded-lg border-2 border-transparent bg-card hover:border-primary hover:shadow-md transition-all active:scale-[0.97] flex flex-col"
                    >
                      {item.image_url && (
                        <div className="aspect-square mb-2 rounded-md overflow-hidden bg-muted">
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      )}
                      <p className="text-sm font-medium line-clamp-2 mb-1 leading-tight">{item.name}</p>
                      <p className="text-sm font-bold text-primary mt-auto">
                        {item.price.toLocaleString()} XAF
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </section>

          {/* === Colonne 3 : Client + Ticket === */}
          <aside className="border-l flex flex-col overflow-hidden bg-card">
            {/* Client */}
            <div className="p-3 border-b">
              <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Client</h3>
              {selectedCustomer ? (
                <div className="flex items-center justify-between bg-primary/10 rounded-md p-2.5">
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{selectedCustomer.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {selectedCustomer.phone || "—"}
                    </p>
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
              ) : (
                <div className="space-y-2">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Nom, téléphone..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      className="pl-10 h-9"
                      autoComplete="off"
                    />
                  </div>
                  {customerSearch && filteredCustomers.length > 0 && (
                    <div className="border rounded-md max-h-32 overflow-y-auto">
                      {filteredCustomers.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setSelectedCustomer(c);
                            setCustomerSearch("");
                          }}
                          className="w-full text-left p-2 hover:bg-accent text-sm border-b last:border-0"
                        >
                          <div className="font-medium">{c.name}</div>
                          <div className="text-xs text-muted-foreground">{c.phone || ""}</div>
                        </button>
                      ))}
                    </div>
                  )}
                  {customerSearch && filteredCustomers.length === 0 && (
                    <p className="text-xs text-muted-foreground">Aucun client trouvé</p>
                  )}
                </div>
              )}
            </div>

            {/* Ticket */}
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="px-3 py-2 border-b flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase text-muted-foreground">
                  Ticket ({totalQty})
                </h3>
                {cart.length > 0 && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setCart([])}
                    className="h-7 text-xs"
                  >
                    Vider
                  </Button>
                )}
              </div>
              <ScrollArea className="flex-1">
                {cart.length === 0 ? (
                  <div className="text-center py-10 text-sm text-muted-foreground px-4">
                    Cliquez sur un plat pour l'ajouter
                  </div>
                ) : (
                  <div className="p-2 space-y-1.5">
                    {cart.map((item) => (
                      <div key={item.id} className="bg-muted/40 rounded-md p-2">
                        <div className="flex justify-between items-start gap-2 mb-1.5">
                          <p className="text-sm font-medium leading-tight flex-1 min-w-0">
                            {item.name}
                          </p>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => removeFromCart(item.id)}
                            className="h-6 w-6 shrink-0"
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Button
                              type="button"
                              size="icon"
                              variant="outline"
                              onClick={() => updateQuantity(item.id, -1)}
                              className="h-7 w-7"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-6 text-center text-sm font-semibold">
                              {item.quantity}
                            </span>
                            <Button
                              type="button"
                              size="icon"
                              variant="outline"
                              onClick={() => updateQuantity(item.id, 1)}
                              className="h-7 w-7"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <span className="text-sm font-bold text-primary">
                            {(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Total + actions */}
            <div className="p-3 border-t bg-muted/30 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total</span>
                <span className="text-xl font-bold text-primary">
                  {totalAmount.toLocaleString()} XAF
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                  className="active:scale-[0.97]"
                >
                  Annuler
                </Button>
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || !selectedCustomer || cart.length === 0}
                  className="active:scale-[0.97]"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Valider"}
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
