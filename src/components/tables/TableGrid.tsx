import React from "react";
import { TableCard } from "./TableCard";
import { TableSession } from "@/hooks/useTableSessions";

interface TableGridProps {
  tableNumbers: string[];
  sessions: TableSession[];
  onTableClick: (tableNumber: string, session: TableSession | null) => void;
}

export const TableGrid: React.FC<TableGridProps> = ({
  tableNumbers,
  sessions,
  onTableClick,
}) => {
  const getSessionForTable = (tableNumber: string) => {
    return sessions.find(
      (s) => s.table_number === tableNumber && (s.status === "active" || s.status === "closed")
    ) || null;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {tableNumbers.map((tableNumber) => {
        const session = getSessionForTable(tableNumber);
        return (
          <TableCard
            key={tableNumber}
            tableNumber={tableNumber}
            session={session}
            onClick={() => onTableClick(tableNumber, session)}
          />
        );
      })}
    </div>
  );
};
