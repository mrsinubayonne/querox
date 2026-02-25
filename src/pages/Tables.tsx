import React, { useState, useEffect, useMemo, useCallback } from "react";
import PageWithSidebar from "@/components/PageWithSidebar";
import SubscriptionGuard from "@/components/SubscriptionGuard";
import { Button } from "@/components/ui/button";
import { RefreshCw, Plus, UserPlus, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TableGrid } from "@/components/tables/TableGrid";
import { CreateSessionWithOrderModal } from "@/components/tables/CreateSessionWithOrderModal";
import { AddOrderFromCustomerModal } from "@/components/tables/AddOrderFromCustomerModal";
import { TableSessionModal } from "@/components/tables/TableSessionModal";
import { RenameTableModal } from "@/components/tables/RenameTableModal";
import { useOptimizedTableSessions, TableSession } from "@/hooks/useOptimizedTableSessions";
import { Skeleton } from "@/components/ui/skeleton";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Tables: React.FC = () => {
  const {
    sessions,
    loading,
    isMutating,
    createSession,
    closeSession,
    markSessionAsPaid,
    reopenSession,
    refetch,
  } = useOptimizedTableSessions();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddOrderModal, setShowAddOrderModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<TableSession | null>(null);
  const [sessionToRename, setSessionToRename] = useState<TableSession | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Generate table numbers (default to 30 tables, expandable)
  const [tableCount, setTableCount] = useState(30);
  const tableNumbers = Array.from({ length: tableCount }, (_, i) => String(i + 1).padStart(2, "0"));

  // Filter sessions based on status
  const filteredSessions = useMemo(() => {
    if (statusFilter === "all") return sessions;
    
    const allTableNumbers = new Set(tableNumbers);
    const occupiedTables = new Set(sessions.filter(s => s.status === "active" || s.status === "closed").map(s => s.table_number));
    
    switch (statusFilter) {
      case "libre":
        // Return empty array for free tables, filter will be applied to table numbers
        return [];
      case "occupee":
        return sessions.filter(s => s.status === "active");
      case "attente":
        return sessions.filter(s => s.status === "closed");
      case "payee":
        return sessions.filter(s => s.status === "paid");
      default:
        return sessions;
    }
  }, [sessions, statusFilter, tableNumbers]);

  // Filter table numbers based on status filter
  const filteredTableNumbers = useMemo(() => {
    if (statusFilter === "all") return tableNumbers;
    
    const occupiedTables = new Set(sessions.filter(s => s.status === "active" || s.status === "closed").map(s => s.table_number));
    
    if (statusFilter === "libre") {
      return tableNumbers.filter(num => !occupiedTables.has(num));
    } else {
      // For occupied, waiting, or paid, only show tables with sessions
      return tableNumbers.filter(num => {
        const session = sessions.find(s => s.table_number === num);
        if (!session) return false;
        
        switch (statusFilter) {
          case "occupee":
            return session.status === "active";
          case "attente":
            return session.status === "closed";
          case "payee":
            return session.status === "paid";
          default:
            return true;
        }
      });
    }
  }, [tableNumbers, sessions, statusFilter]);

  // Sync selected session when sessions update
  useEffect(() => {
    if (selectedSession) {
      const updatedSession = sessions.find(s => s.id === selectedSession.id);
      if (updatedSession) {
        setSelectedSession(updatedSession);
      }
    }
  }, [sessions]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handleSessionUpdate = () => refetch();
    window.addEventListener("session-updated", handleSessionUpdate);
    return () => window.removeEventListener("session-updated", handleSessionUpdate);
  }, [refetch]);

  const handleTableClick = (tableNumber: string, session: TableSession | null) => {
    setSelectedTable(tableNumber);
    setSelectedSession(session);

    if (session) {
      setShowSessionModal(true);
    } else {
      setShowCreateModal(true);
    }
  };

  const handleCreateSuccess = () => {
    refetch();
    setSelectedTable(null);
  };

  const handleCloseSession = async (sessionId: string) => {
    try {
      await closeSession(sessionId);
    } catch (e) {
      console.error('Error closing session:', e);
    } finally {
      setShowSessionModal(false);
      setSelectedSession(null);
    }
  };

  const handleMarkAsPaid = async (sessionId: string, paymentMethod?: string) => {
    try {
      await markSessionAsPaid(sessionId, paymentMethod);
      await refetch();
    } catch (e) {
      console.error('Error marking as paid:', e);
    } finally {
      setShowSessionModal(false);
      setSelectedSession(null);
    }
  };

  const handleTableRename = useCallback((session: TableSession) => {
    setSessionToRename(session);
    setShowRenameModal(true);
  }, []);

  const handleTableReopen = useCallback(async (session: TableSession) => {
    await reopenSession(session.id);
  }, [reopenSession]);

  const handleQuickPayFromTable = useCallback(async (session: TableSession) => {
    await handleMarkAsPaid(session.id, "Espèces");
  }, [handleMarkAsPaid]);

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

            <div className="flex gap-2">
              <Button onClick={() => refetch()} variant="outline" size="icon" disabled={loading}>
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button disabled={loading}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nouvelle commande
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => {
                    setSelectedTable(null);
                    setShowAddOrderModal(true);
                  }}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Client existant
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Badge
              variant={statusFilter === "all" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setStatusFilter("all")}
            >
              Tous
            </Badge>
            <Badge
              variant={statusFilter === "libre" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setStatusFilter("libre")}
            >
              Libres
            </Badge>
            <Badge
              variant={statusFilter === "occupee" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setStatusFilter("occupee")}
            >
              Occupées
            </Badge>
            <Badge
              variant={statusFilter === "attente" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setStatusFilter("attente")}
            >
              En attente
            </Badge>
            <Badge
              variant={statusFilter === "payee" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setStatusFilter("payee")}
            >
              Payées
            </Badge>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-card border rounded-lg">
              <p className="text-sm text-muted-foreground">Tables Libres</p>
              <p className="text-2xl font-bold text-emerald-600">
                {tableNumbers.length - sessions.filter(s => s.status === "active" || s.status === "closed").length}
              </p>
            </div>
            <div className="p-4 bg-card border rounded-lg">
              <p className="text-sm text-muted-foreground">Tables Occupées</p>
              <p className="text-2xl font-bold text-red-600">
                {sessions.filter(s => s.status === "active").length}
              </p>
            </div>
            <div className="p-4 bg-card border rounded-lg">
              <p className="text-sm text-muted-foreground">En Attente de Paiement</p>
              <p className="text-2xl font-bold text-yellow-600">
                {sessions.filter(s => s.status === "closed").length}
              </p>
            </div>
            <div className="p-4 bg-card border rounded-lg">
              <p className="text-sm text-muted-foreground">Total à Encaisser</p>
              <p className="text-2xl font-bold text-blue-600">
                {new Intl.NumberFormat("fr-FR", {
                  style: "currency",
                  currency: "XOF",
                  minimumFractionDigits: 0,
                }).format(
                  sessions
                    .filter(s => s.status === "active" || s.status === "closed")
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
            <>
              <TableGrid
                sessions={sessions}
                filteredTableNumbers={filteredTableNumbers}
                onTableClick={handleTableClick}
                onTableRename={handleTableRename}
                onMarkAsPaid={handleQuickPayFromTable}
              />
              {filteredTableNumbers.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  Aucune table ne correspond aux filtres sélectionnés
                </div>
              )}
              {statusFilter === "all" && tableCount < 120 && (
                <div className="flex justify-center pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setTableCount(prev => Math.min(prev + 30, 120))}
                  >
                    Afficher plus de tables ({tableCount}/120)
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Modals */}
          {selectedTable && (
            <CreateSessionWithOrderModal
              isOpen={showCreateModal}
              onClose={() => {
                setShowCreateModal(false);
                setSelectedTable(null);
              }}
              onSuccess={handleCreateSuccess}
              tableNumber={selectedTable}
            />
          )}

          <AddOrderFromCustomerModal
            isOpen={showAddOrderModal}
            onClose={() => {
              setShowAddOrderModal(false);
              setSelectedTable(null);
            }}
            onSuccess={handleCreateSuccess}
            tableNumber={selectedTable || "01"}
          />

          <TableSessionModal
            isOpen={showSessionModal}
            onClose={() => {
              setShowSessionModal(false);
              setSelectedSession(null);
            }}
            session={selectedSession}
            onCloseSession={handleCloseSession}
            onMarkAsPaid={handleMarkAsPaid}
            isMutating={isMutating}
            onReopenSession={async (sessionId: string) => {
              await reopenSession(sessionId);
            }}
          />

          {sessionToRename && (
            <RenameTableModal
              isOpen={showRenameModal}
              onClose={() => {
                setShowRenameModal(false);
                setSessionToRename(null);
              }}
              sessionId={sessionToRename.id}
              currentName={sessionToRename.custom_table_name || `Table ${sessionToRename.table_number}`}
              onSuccess={() => {
                refetch();
                setShowRenameModal(false);
                setSessionToRename(null);
              }}
            />
          )}
        </div>
      </PageWithSidebar>
    </SubscriptionGuard>
  );
};

export default Tables;
