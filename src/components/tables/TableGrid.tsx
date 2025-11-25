import React from "react";
import { TableCard } from "./TableCard";
import { TableSession } from "@/hooks/useTableSessions";

interface TableGridProps {
  sessions: TableSession[];
  onTableClick: (tableNumber: string, session: TableSession | null) => void;
  onTableRename?: (session: TableSession) => void;
}

export const TableGrid: React.FC<TableGridProps> = ({
  sessions,
  onTableClick,
  onTableRename,
}) => {
  // Generate table numbers (default to 120 tables)
  const tableNumbers = Array.from({ length: 120 }, (_, i) => String(i + 1).padStart(2, "0"));
  const getSessionForTable = (tableNumber: string) => {
    return sessions.find(
      (s) => s.table_number === tableNumber && (s.status === "active" || s.status === "closed")
    ) || null;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 animate-in fade-in duration-500">
      {tableNumbers.map((tableNumber, index) => {
        const session = getSessionForTable(tableNumber);
        return (
          <div
            key={tableNumber}
            className="animate-in slide-in-from-bottom duration-300"
            style={{ animationDelay: `${index * 20}ms` }}
          >
            <TableCard
              tableNumber={tableNumber}
              session={session}
              onClick={() => onTableClick(tableNumber, session)}
              onRename={session && onTableRename ? () => onTableRename(session) : undefined}
            />
          </div>
        );
      })}
    </div>
  );
};
