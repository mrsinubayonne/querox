import React from "react";
import { useFloorPlan } from "@/hooks/useFloorPlan";
import { useOptimizedTableSessions } from "@/hooks/useOptimizedTableSessions";
import { useOutlets } from "@/hooks/useOutlets";
import { format } from "date-fns";

const statusColor = (status: string | undefined) => {
  if (!status) return { bg: "#d1fae5", border: "#10b981", text: "#065f46" };
  if (status === "active") return { bg: "#fee2e2", border: "#ef4444", text: "#991b1b" };
  if (status === "closed") return { bg: "#fef3c7", border: "#f59e0b", text: "#92400e" };
  if (status === "paid") return { bg: "#dbeafe", border: "#3b82f6", text: "#1e40af" };
  return { bg: "#f3f4f6", border: "#9ca3af", text: "#374151" };
};

interface Props {
  containerId: string;
}

/**
 * Rendu hors-écran du plan de salle, ciblé par html2canvas pour générer
 * une image / PDF utilisable même en mode hors ligne.
 */
export const FloorPlanSnapshot: React.FC<Props> = ({ containerId }) => {
  const { zones, tables } = useFloorPlan();
  const { sessions } = useOptimizedTableSessions();
  const { outlets, selectedOutletId } = useOutlets();
  const outletName = outlets?.find((o) => o.id === selectedOutletId)?.name || "—";

  const zone = zones[0];
  if (!zone) return null;
  const zoneTables = tables.filter((t) => t.zone_id === zone.id);

  const sessionByNumber = new Map<string, any>();
  sessions.forEach((s) => {
    if (["active", "closed", "paid"].includes(s.status)) {
      const ex = sessionByNumber.get(s.table_number);
      if (!ex || ex.status === "paid") sessionByNumber.set(s.table_number, s);
    }
  });

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        transform: "translate(-200vw, 0)",
        pointerEvents: "none",
      }}
      aria-hidden
    >
      <div
        id={containerId}
        style={{
          background: "#ffffff",
          padding: 24,
          width: Math.max(zone.width + 48, 900),
          fontFamily: "system-ui, -apple-system, sans-serif",
          color: "#111827",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>Plan de salle — {outletName}</div>
            <div style={{ fontSize: 13, color: "#6b7280" }}>Salle : {zone.name}</div>
          </div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>
            Généré le {format(new Date(), "dd-MM-yy HH:mm")}
          </div>
        </div>

        <div style={{ display: "flex", gap: 16, marginBottom: 12, fontSize: 12 }}>
          {[
            { l: "Libre", c: "#10b981" },
            { l: "Occupée", c: "#ef4444" },
            { l: "En attente", c: "#f59e0b" },
            { l: "Payée", c: "#3b82f6" },
          ].map((s) => (
            <div key={s.l} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 12, height: 12, background: s.c, borderRadius: 3, display: "inline-block" }} />
              {s.l}
            </div>
          ))}
        </div>

        <div
          style={{
            position: "relative",
            width: zone.width,
            height: zone.height,
            background:
              "linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            border: "1px solid #e5e7eb",
            borderRadius: 12,
          }}
        >
          {zoneTables.map((t) => {
            const sess = sessionByNumber.get(t.table_number);
            const c = statusColor(sess?.status);
            const isRound = t.shape === "round";
            return (
              <div
                key={t.id}
                style={{
                  position: "absolute",
                  left: t.x,
                  top: t.y,
                  width: t.width,
                  height: t.height,
                  background: c.bg,
                  border: `2px solid ${c.border}`,
                  color: c.text,
                  borderRadius: isRound ? "50%" : 10,
                  transform: `rotate(${t.rotation}deg)`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 600,
                  lineHeight: 1.2,
                }}
              >
                <div style={{ fontSize: 14 }}>{t.table_number}</div>
                <div style={{ fontSize: 10, opacity: 0.75 }}>{t.seats}p</div>
                {sess && (
                  <div style={{ fontSize: 10, marginTop: 2 }}>
                    {new Intl.NumberFormat("fr-FR").format(sess.total_amount || 0)} XOF
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 12, fontSize: 11, color: "#9ca3af" }}>
          {zoneTables.length} table(s) · {outletName}
        </div>
      </div>
    </div>
  );
};
