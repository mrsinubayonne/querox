import React, { useMemo, useState } from "react";
import PageWithSidebar from "@/components/PageWithSidebar";
import SubscriptionGuard from "@/components/SubscriptionGuard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw } from "lucide-react";
import { useServiceTables, type ServiceSession } from "@/hooks/useServiceTables";
import { ServiceTableCard } from "@/components/service/ServiceTableCard";
import { ServiceOrderModal } from "@/components/service/ServiceOrderModal";
import { ServiceFloorPlan } from "@/components/service/ServiceFloorPlan";

type ModalState =
  | { type: "none" }
  | { type: "order"; tableNumber: string; session: ServiceSession | null };

const formatXAF = (n: number) =>
  new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(n) + " F CFA";

const Service: React.FC = () => {
  const {
    sessionByTable,
    loading,
    refreshing,
    refresh,
    openTable,
    addOrder,
    payAndClose,
    payingSessionId,
  } = useServiceTables();

  const [modal, setModal] = useState<ModalState>({ type: "none" });
  const [filter, setFilter] = useState<"all" | "libre" | "occupee">("all");
  const [tableCount, setTableCount] = useState(30);

  const tableNumbers = useMemo(() => {
    const base = Array.from({ length: tableCount }, (_, i) => String(i + 1).padStart(2, "0"));
    const extras = Array.from(sessionByTable.keys());
    return Array.from(new Set([...base, ...extras])).sort(
      (a, b) => Number.parseInt(a, 10) - Number.parseInt(b, 10),
    );
  }, [tableCount, sessionByTable]);

  const visibleTables = useMemo(() => {
    if (filter === "all") return tableNumbers;
    if (filter === "libre") return tableNumbers.filter((n) => !sessionByTable.has(n));
    return tableNumbers.filter((n) => sessionByTable.has(n));
  }, [tableNumbers, sessionByTable, filter]);

  const occupiedCount = sessionByTable.size;
  const totalDue = useMemo(
    () => Array.from(sessionByTable.values()).reduce((s, x) => s + Number(x.total_amount || 0), 0),
    [sessionByTable],
  );

  const handleTableClick = (tableNumber: string, session: ServiceSession | null) => {
    setModal({ type: "order", tableNumber, session });
  };

  const handleSubmitOrder = async (
    lines: Parameters<typeof addOrder>[0]["items"],
    total: number,
    guests?: number,
  ) => {
    if (modal.type !== "order") return;
    if (modal.session) {
      await addOrder({
        sessionId: modal.session.id,
        tableNumber: modal.tableNumber,
        items: lines,
        totalAmount: total,
      });
    } else {
      await openTable({
        tableNumber: modal.tableNumber,
        numberOfGuests: guests,
        items: lines,
        totalAmount: total,
      });
    }
  };

  return (
    <SubscriptionGuard feature="le service en salle">
      <PageWithSidebar>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">Service</h1>
              <p className="text-muted-foreground mt-1">
                Prise de commande et encaissement du jour
              </p>
            </div>
            <Button variant="outline" size="icon" onClick={() => refresh()} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(["all", "libre", "occupee"] as const).map((f) => (
              <Badge
                key={f}
                variant={filter === f ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setFilter(f)}
              >
                {f === "all" ? "Toutes" : f === "libre" ? "Libres" : "Occupées"}
              </Badge>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-4 bg-card border rounded-lg">
              <p className="text-sm text-muted-foreground">Tables libres</p>
              <p className="text-2xl font-bold text-emerald-600">
                {tableNumbers.length - occupiedCount}
              </p>
            </div>
            <div className="p-4 bg-card border rounded-lg">
              <p className="text-sm text-muted-foreground">Tables occupées</p>
              <p className="text-2xl font-bold text-destructive">{occupiedCount}</p>
            </div>
            <div className="p-4 bg-card border rounded-lg">
              <p className="text-sm text-muted-foreground">À encaisser</p>
              <p className="text-2xl font-bold text-blue-600">{formatXAF(totalDue)}</p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : (
            <Tabs defaultValue="grid" className="w-full">
              <TabsList>
                <TabsTrigger value="grid">Grille</TabsTrigger>
                <TabsTrigger value="plan">Plan de salle</TabsTrigger>
              </TabsList>

              <TabsContent value="grid" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {visibleTables.map((n) => {
                    const session = sessionByTable.get(n) || null;
                    return (
                      <ServiceTableCard
                        key={n}
                        tableNumber={n}
                        session={session}
                        paying={!!session && payingSessionId === session.id}
                        onOpen={() => handleTableClick(n, session)}
                        onPay={
                          session
                            ? () => void payAndClose({ sessionId: session.id }).catch(() => undefined)
                            : undefined
                        }
                      />
                    );
                  })}
                </div>
                {filter === "all" && tableCount < 120 && (
                  <div className="flex justify-center pt-2">
                    <Button variant="outline" onClick={() => setTableCount((p) => Math.min(p + 30, 120))}>
                      Afficher plus de tables ({tableCount}/120)
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="plan">
                <ServiceFloorPlan sessionByTable={sessionByTable} onTableClick={handleTableClick} />
              </TabsContent>
            </Tabs>
          )}

          {modal.type === "order" && (
            <ServiceOrderModal
              open
              onClose={() => setModal({ type: "none" })}
              tableNumber={modal.tableNumber}
              session={modal.session}
              onSubmit={handleSubmitOrder}
            />
          )}
        </div>
      </PageWithSidebar>
    </SubscriptionGuard>
  );
};

export default Service;
