import React, { useState, useEffect } from "react";
import PageWithSidebar from "@/components/PageWithSidebar";
import SubscriptionGuard from "@/components/SubscriptionGuard";
import { Button } from "@/components/ui/button";
import { RefreshCw, Plus, UserPlus } from "lucide-react";
import { TableGrid } from "@/components/tables/TableGrid";
import { CreateSessionWithOrderModal } from "@/components/tables/CreateSessionWithOrderModal";
import { AddOrderFromCustomerModal } from "@/components/tables/AddOrderFromCustomerModal";
import { TableSessionModal } from "@/components/tables/TableSessionModal";
import { useTableSessions, TableSession } from "@/hooks/useTableSessions";
import { Skeleton } from "@/components/ui/skeleton";
import SubscriptionPopup from "@/components/SubscriptionPopup";
import { supabase } from "@/integrations/supabase/client";
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
    createSession,
    closeSession,
    markSessionAsPaid,
    refetch,
  } = useTableSessions();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddOrderModal, setShowAddOrderModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<TableSession | null>(null);

  // Generate table numbers (default to 120 tables)
  const tableNumbers = Array.from({ length: 120 }, (_, i) => String(i + 1).padStart(2, "0"));

  // Écouter les mises à jour de session depuis le modal et en temps réel
  useEffect(() => {
    const handleSessionUpdate = () => {
      refetch();
      // Si le modal est ouvert, mettre à jour la session affichée
      if (selectedSession) {
        const updatedSession = sessions.find(s => s.id === selectedSession.id);
        if (updatedSession) {
          setSelectedSession(updatedSession);
        }
      }
    };

    window.addEventListener("session-updated", handleSessionUpdate);
    
    // Écouter les changements en temps réel sur les sessions (nouvelles commandes créant des sessions)
    const channel = supabase
      .channel('table-sessions-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'table_sessions'
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      window.removeEventListener("session-updated", handleSessionUpdate);
      supabase.removeChannel(channel);
    };
  }, [refetch, selectedSession, sessions]);

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

            <div className="flex gap-2">
              <Button onClick={refetch} variant="outline" size="icon" disabled={loading}>
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
            <TableGrid
              tableNumbers={tableNumbers}
              sessions={sessions}
              onTableClick={handleTableClick}
            />
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
          />
        </div>
        <SubscriptionPopup />
      </PageWithSidebar>
    </SubscriptionGuard>
  );
};

export default Tables;
