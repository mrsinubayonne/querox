import type { TableSession } from "@/hooks/useOptimizedTableSessions";

export const normalizeTableNumber = (value: string | number | null | undefined): string => {
  const raw = String(value ?? "").trim();
  const match = raw.match(/\d+/);
  if (!match) return raw;

  const numeric = Number.parseInt(match[0], 10);
  if (!Number.isFinite(numeric) || numeric <= 0) return raw;

  return String(numeric).padStart(2, "0");
};

export const isOccupyingTable = (session: Pick<TableSession, "status">): boolean =>
  session.status === "active" || session.status === "closed";

export const pickSessionForTable = (
  current: TableSession | undefined,
  next: TableSession
): TableSession => {
  if (!current) return next;
  if (current.status === "closed" && next.status === "active") return next;
  if (current.status === "active" && next.status === "closed") return current;

  const currentTime = Date.parse(current.updated_at || current.started_at || current.created_at || "");
  const nextTime = Date.parse(next.updated_at || next.started_at || next.created_at || "");
  return nextTime > currentTime ? next : current;
};

export const getSessionTableNumber = (session: Pick<TableSession, "table_number">): string =>
  normalizeTableNumber(session.table_number);