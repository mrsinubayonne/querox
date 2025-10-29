import React, { useState } from "react";
import PageWithSidebar from "@/components/PageWithSidebar";
import SubscriptionGuard from "@/components/SubscriptionGuard";
import { Button } from "@/components/ui/button";
import { RefreshCw, Plus } from "lucide-react";
import { TableGrid } from "@/components/tables/TableGrid";
import { OpenSessionModal } from "@/components/tables/OpenSessionModal";
import { TableSessionModal } from "@/components/tables/TableSessionModal";
import { useTableSessions, TableSession } from "@/hooks/useTableSessions";
import { Skeleton } from "@/components/ui/skeleton";

const Tables: React.FC = () => {
  const {
    sessions,
    loading,
    createSession,
    closeSession,
    markSessionAsPaid,
    refetch,
  } = useTableSessions();

  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<TableSession | null>(null);
  const [creatingSession, setCreatingSession] = useState(false);

  // Generate table numbers (you can customize this based on your needs)
  const tableNumbers = Array.from({ length: 20 }, (_, i) => String(i + 1).padStart(2, "0"));

  const handleTableClick = (tableNumber: string, session: TableSession | null) => {
    setSelectedTable(tableNumber);
    setSelectedSession(session);

    if (session) {
      setShowSessionModal(true);
    } else {
      setShowOpenModal(true);
    }
  };

  const handleOpenSession = async (numberOfGuests: number, notes: string) => {
    if (!selectedTable) return;

    setCreatingSession(true);
    const session = await createSession(selectedTable, numberOfGuests, notes);
    setCreatingSession(false);

    if (session) {
      setShowOpenModal(false);
      setSelectedTable(null);
    }
  };

  const handleCloseSession = async () => {
    if (!selectedSession) return;

    await closeSession(selectedSession.id);
    setShowSessionModal(false);
    setSelectedSession(null);
  };

  const handleMarkAsPaid = async () => {
    if (!selectedSession) return;

    await markSessionAsPaid(selectedSession.id);
    setShowSessionModal(false);
    setSelectedSession(null);
  };

  return (
    <SubscriptionGuard feature="la gestion des tables">
      <PageWithSidebar>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">🪑 Gestion des Tables</h1>
              <p className="text-muted-foreground mt-1">
                Gérez vos tables et sessions en temps réel
              </p>
            </div>

            <Button onClick={refetch} variant="outline" size="icon" disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-card border rounded-lg">
              <p className="text-sm text-muted-foreground">Tables Libres</p>
              <p className="text-2xl font-bold text-success">
                {tableNumbers.length - sessions.filter(s => s.status === "active" || s.status === "closed").length}
              </p>
            </div>
            <div className="p-4 bg-card border rounded-lg">
              <p className="text-sm text-muted-foreground">Tables Occupées</p>
              <p className="text-2xl font-bold text-destructive">
                {sessions.filter(s => s.status === "active").length}
              </p>
            </div>
            <div className="p-4 bg-card border rounded-lg">
              <p className="text-sm text-muted-foreground">En Attente</p>
              <p className="text-2xl font-bold text-warning">
                {sessions.filter(s => s.status === "closed").length}
              </p>
            </div>
            <div className="p-4 bg-card border rounded-lg">
              <p className="text-sm text-muted-foreground">Total Actif</p>
              <p className="text-2xl font-bold text-primary">
                {new Intl.NumberFormat("fr-FR", {
                  style: "currency",
                  currency: "XOF",
                  minimumFractionDigits: 0,
                }).format(
                  sessions
                    .filter(s => s.status === "active")
                    .reduce((sum, s) => sum + s.total_amount, 0)
                )}
              </p>
            </div>
          </div>

          {/* Table Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {[...Array(12)].map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : (
            <TableGrid
              tableNumbers={tableNumbers}
              sessions={sessions}
              onTableClick={handleTableClick}
            />
          )}

          {/* Modals */}
          {selectedTable && (
            <OpenSessionModal
              isOpen={showOpenModal}
              onClose={() => {
                setShowOpenModal(false);
                setSelectedTable(null);
              }}
              onConfirm={handleOpenSession}
              tableNumber={selectedTable}
              loading={creatingSession}
            />
          )}

          <TableSessionModal
            isOpen={showSessionModal}
            onClose={() => {
              setShowSessionModal(false);
              setSelectedSession(null);
            }}
            session={selectedSession}
            onCloseSession={handleCloseSession}
            onMarkAsPaid={handleMarkAsPaid}
          />
        </div>
      </PageWithSidebar>
    </SubscriptionGuard>
  );
};

export default Tables;
