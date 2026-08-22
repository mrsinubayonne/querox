import React, { useMemo, useState } from "react";
import { useFloorPlan } from "@/hooks/useFloorPlan";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { normalizeTableNo, type ServiceSession } from "@/hooks/useServiceTables";

interface Props {
  sessionByTable: Map<string, ServiceSession>;
  onTableClick: (tableNumber: string, session: ServiceSession | null) => void;
}

export const ServiceFloorPlan: React.FC<Props> = ({ sessionByTable, onTableClick }) => {
  const { zones, tables, loading } = useFloorPlan();
  const [activeZoneId, setActiveZoneId] = useState<string | null>(null);

  const activeZone = useMemo(
    () => zones.find((z) => z.id === activeZoneId) ?? zones[0],
    [zones, activeZoneId],
  );

  const zoneTables = useMemo(
    () => tables.filter((t) => t.zone_id === activeZone?.id),
    [tables, activeZone],
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (!activeZone) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        Aucun plan de salle enregistré pour ce point de vente. Créez-le depuis l'onglet Tables.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {zones.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {zones.map((z) => (
            <Button
              key={z.id}
              size="sm"
              variant={z.id === activeZone.id ? "default" : "outline"}
              onClick={() => setActiveZoneId(z.id)}
            >
              {z.name}
            </Button>
          ))}
        </div>
      )}

      <div
        className="relative rounded-xl border bg-muted/20 overflow-auto"
        style={{ width: "100%", height: Math.max(activeZone.height || 600, 400) }}
      >
        {zoneTables.map((t) => {
          const key = normalizeTableNo(t.table_number);
          const session = sessionByTable.get(key) || null;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onTableClick(key, session)}
              style={{
                position: "absolute",
                left: t.x,
                top: t.y,
                width: t.width,
                height: t.height,
                transform: `rotate(${t.rotation || 0}deg)`,
              }}
              className={cn(
                "border-2 flex flex-col items-center justify-center text-xs font-semibold transition active:scale-[0.97]",
                t.shape === "round" ? "rounded-full" : "rounded-lg",
                session
                  ? "bg-destructive/15 border-destructive text-destructive"
                  : "bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-300",
              )}
            >
              <span>{t.label || `T${key}`}</span>
              {session && (
                <span className="text-[10px] font-bold">
                  {Number(session.total_amount || 0).toLocaleString()}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ServiceFloorPlan;
