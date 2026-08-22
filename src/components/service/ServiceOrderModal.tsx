import React, { useCallback, useDeferredValue, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Loader2, Minus, Plus, Search, ShoppingCart, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useInternalMenuItems } from "@/hooks/useInternalMenuItems";
import { useMenuItemOptionsPicker } from "@/components/menu-management/useMenuItemOptionsPicker";
import { PosProductTile, colorForCategory } from "@/components/tables/pos/PosProductTile";
import type { MenuItem, SelectedOption } from "@/types/menu";
import type { ServiceOrderLine, ServiceSession } from "@/hooks/useServiceTables";

interface Props {
  open: boolean;
  onClose: () => void;
  tableNumber: string;
  session: ServiceSession | null;
  onSubmit: (lines: ServiceOrderLine[], total: number, guests?: number) => Promise<unknown>;
}

interface TicketLine {
  key: string;
  id: string;
  name: string;
  price: number;
  quantity: number;
  selected_options?: SelectedOption[];
  options_label?: string;
}

export const ServiceOrderModal: React.FC<Props> = ({
  open,
  onClose,
  tableNumber,
  session,
  onSubmit,
}) => {
  const { menuItems, loading: menuLoading } = useInternalMenuItems(open);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [category, setCategory] = useState("__all__");
  const [ticket, setTicket] = useState<TicketLine[]>([]);
  const [guests, setGuests] = useState("");
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (!open) {
      setTicket([]);
      setSearch("");
      setCategory("__all__");
      setGuests("");
      setSaving(false);
    }
  }, [open]);

  const addResolved = useCallback((item: MenuItem, result: { unitPrice: number; selectedOptions: SelectedOption[]; optionsLabel: string; cartKey: string }) => {
    setTicket((prev) => {
      const existing = prev.find((l) => l.key === result.cartKey);
      if (existing) {
        return prev.map((l) =>
          l.key === result.cartKey ? { ...l, quantity: l.quantity + 1 } : l,
        );
      }
      return [
        ...prev,
        {
          key: result.cartKey,
          id: item.id,
          name: item.name,
          price: result.unitPrice,
          quantity: 1,
          selected_options: result.selectedOptions,
          options_label: result.optionsLabel,
        },
      ];
    });
  }, []);

  const { requestAdd, pickerNode } = useMenuItemOptionsPicker(addResolved);

  const categories = useMemo(() => {
    const set = new Set<string>();
    (menuItems as MenuItem[]).forEach((it) => set.add((it as any).category_name || "Autres"));
    return Array.from(set).sort();
  }, [menuItems]);

  const filtered = useMemo(() => {
    const term = deferredSearch.trim().toLowerCase();
    return (menuItems as MenuItem[]).filter((item) => {
      const cat = (item as any).category_name || "Autres";
      if (category !== "__all__" && cat !== category) return false;
      if (!term) return true;
      return item.name.toLowerCase().includes(term);
    });
  }, [menuItems, deferredSearch, category]);

  const total = useMemo(
    () => ticket.reduce((sum, l) => sum + l.price * l.quantity, 0),
    [ticket],
  );

  const changeQty = (key: string, delta: number) => {
    setTicket((prev) =>
      prev
        .map((l) => (l.key === key ? { ...l, quantity: l.quantity + delta } : l))
        .filter((l) => l.quantity > 0),
    );
  };

  const handleSubmit = async () => {
    if (ticket.length === 0 || saving) return;
    setSaving(true);
    try {
      const lines: ServiceOrderLine[] = ticket.map((l) => ({
        id: l.id,
        name: l.options_label ? `${l.name} (${l.options_label})` : l.name,
        price: l.price,
        quantity: l.quantity,
        selected_options: l.selected_options || [],
      }));
      await onSubmit(lines, total, guests ? Number(guests) : undefined);
      onClose();
    } catch {
      // l'erreur est déjà notifiée : on garde le ticket à l'écran pour réessayer
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="max-w-5xl w-[96vw] h-[88vh] p-0 overflow-hidden flex flex-col">
          <DialogTitle className="sr-only">Commande table {tableNumber}</DialogTitle>
          <DialogDescription className="sr-only">Prise de commande</DialogDescription>

          <div className="flex items-center justify-between gap-3 px-4 py-3 border-b">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              <p className="text-lg font-bold">
                {session ? `Table ${tableNumber} — ajouter` : `Ouvrir la Table ${tableNumber}`}
              </p>
            </div>
            {!session && (
              <Input
                value={guests}
                onChange={(e) => setGuests(e.target.value.replace(/\D/g, ""))}
                placeholder="Couverts"
                className="w-28 h-9"
                inputMode="numeric"
              />
            )}
          </div>

          <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-[1fr_340px]">
            {/* Produits */}
            <div className="flex flex-col min-h-0 border-r">
              <div className="p-3 space-y-3">
                <div className="flex gap-2 flex-wrap">
                  <Badge
                    variant={category === "__all__" ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setCategory("__all__")}
                  >
                    Toutes ({menuItems.length})
                  </Badge>
                  {categories.map((c) => (
                    <Badge
                      key={c}
                      variant={category === c ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setCategory(c)}
                    >
                      {c}
                    </Badge>
                  ))}
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    autoFocus
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Rechercher un plat…"
                    className="pl-9"
                  />
                </div>
              </div>

              <ScrollArea className="flex-1 min-h-0 px-3 pb-3">
                {menuLoading && filtered.length === 0 ? (
                  <div className="flex items-center justify-center py-10 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    {filtered.map((item) => (
                      <PosProductTile
                        key={item.id}
                        id={item.id}
                        name={item.name}
                        price={Number(item.price) || 0}
                        accent={colorForCategory((item as any).category_name || "Autres")}
                        onClick={() => requestAdd(item)}
                      />
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Ticket */}
            <div className="flex flex-col min-h-0">
              <div className="flex items-center justify-between px-3 py-2 border-b">
                <p className="font-semibold">Ticket ({ticket.length})</p>
                {ticket.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={() => setTicket([])}>
                    <Trash2 className="h-4 w-4" /> Vider
                  </Button>
                )}
              </div>

              <ScrollArea className="flex-1 min-h-0 p-3 space-y-2">
                {ticket.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Sélectionnez des plats
                  </p>
                )}
                {ticket.map((l) => (
                  <div key={l.key} className="rounded-lg border p-2 mb-2">
                    <div className="flex justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{l.name}</p>
                        {l.options_label && (
                          <p className="text-xs text-muted-foreground truncate">{l.options_label}</p>
                        )}
                      </div>
                      <p className="text-sm font-bold whitespace-nowrap">
                        {(l.price * l.quantity).toLocaleString()} XAF
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => changeQty(l.key, -1)}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm font-semibold">{l.quantity}</span>
                      <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => changeQty(l.key, 1)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </ScrollArea>

              <div className="border-t p-3 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="text-xl font-bold">{total.toLocaleString()} XAF</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={onClose} disabled={saving}>
                    Annuler
                  </Button>
                  <Button
                    className={cn("flex-1")}
                    onClick={handleSubmit}
                    disabled={saving || ticket.length === 0}
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Enregistrer
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {pickerNode}
    </>
  );
};

export default ServiceOrderModal;
