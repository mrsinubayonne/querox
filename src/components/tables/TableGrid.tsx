import React from "react";
import { TableCard } from "./TableCard";
import { TableSession } from "@/hooks/useTableSessions";

interface TableGridProps {
  sessions: TableSession[];
  onTableClick: (tableNumber: string, session: TableSession | null) => void;
  onTableRename?: (session: TableSession) => void;
  filteredTableNumbers?: string[];
}

export const TableGrid: React.FC<TableGridProps> = ({
  sessions,
  onTableClick,
  onTableRename,
  filteredTableNumbers,
}) => {
  // Generate table numbers (default to 120 tables)
  const defaultTableNumbers = Array.from({ length: 120 }, (_, i) => String(i + 1).padStart(2, "0"));
  const tableNumbers = filteredTableNumbers || defaultTableNumbers;
  
  const getSessionForTable = (tableNumber: string) => {
    return sessions.find(
      (s) => s.table_number === tableNumber && (s.status === "active" || s.status === "closed")
    ) || null;
  };

  // Get custom name for free tables from localStorage
  const getCustomTableName = (tableNumber: string): string | null => {
    const storedNames = localStorage.getItem('custom_table_names');
    if (storedNames) {
      const names = JSON.parse(storedNames);
      return names[tableNumber] || null;
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 animate-in fade-in duration-500">
      {tableNumbers.map((tableNumber, index) => {
        const session = getSessionForTable(tableNumber);
        const customName = session?.custom_table_name || getCustomTableName(tableNumber);
        
        // Create a pseudo session for free tables with custom names
        const displaySession = session || (customName ? {
          ...({} as TableSession),
          table_number: tableNumber,
          custom_table_name: customName,
        } : null);

        return (
          <div
            key={tableNumber}
            className="animate-in slide-in-from-bottom duration-300"
            style={{ animationDelay: `${index * 20}ms` }}
          >
            <TableCard
              tableNumber={tableNumber}
              session={displaySession}
              onClick={() => onTableClick(tableNumber, session)}
              onRename={onTableRename ? () => {
                if (session) {
                  onTableRename(session);
                } else {
                  // Handle free table renaming
                  const newName = prompt("Nom personnalisé pour cette table:", customName || `Table ${tableNumber}`);
                  if (newName) {
                    const storedNames = localStorage.getItem('custom_table_names');
                    const names = storedNames ? JSON.parse(storedNames) : {};
                    names[tableNumber] = newName;
                    localStorage.setItem('custom_table_names', JSON.stringify(names));
                    window.location.reload(); // Quick refresh to show new name
                  }
                }
              } : undefined}
            />
          </div>
        );
      })}
    </div>
  );
};
