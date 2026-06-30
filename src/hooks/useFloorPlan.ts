import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useOutletContext } from "@/contexts/OutletContext";
import { toast } from "sonner";

export type FloorPlanShape = "rectangle" | "round" | "square" | "bar";

export interface FloorPlanZone {
  id: string;
  user_id: string;
  outlet_id: string;
  name: string;
  sort_order: number;
  width: number;
  height: number;
  background_color: string | null;
}

export interface FloorPlanTable {
  id: string;
  user_id: string;
  outlet_id: string;
  zone_id: string;
  table_number: string;
  shape: FloorPlanShape;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  seats: number;
  label: string | null;
}

export const useFloorPlan = () => {
  const { user, isTeamMember, teamMemberSession } = useAuth();
  const { selectedOutletId } = useOutletContext();
  const ownerId = isTeamMember ? teamMember?.ownerId : user?.id;

  const [zones, setZones] = useState<FloorPlanZone[]>([]);
  const [tables, setTables] = useState<FloorPlanTable[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    if (!ownerId || !selectedOutletId) {
      setZones([]);
      setTables([]);
      return;
    }
    setLoading(true);
    try {
      const [{ data: z, error: ze }, { data: t, error: te }] = await Promise.all([
        supabase
          .from("floor_plan_zones")
          .select("*")
          .eq("user_id", ownerId)
          .eq("outlet_id", selectedOutletId)
          .order("sort_order", { ascending: true }),
        supabase
          .from("floor_plan_tables")
          .select("*")
          .eq("user_id", ownerId)
          .eq("outlet_id", selectedOutletId),
      ]);
      if (ze) throw ze;
      if (te) throw te;
      setZones((z as FloorPlanZone[]) || []);
      setTables((t as FloorPlanTable[]) || []);
    } catch (e: any) {
      console.error(e);
      toast.error("Plan de salle", { description: e?.message || "Erreur de chargement" });
    } finally {
      setLoading(false);
    }
  }, [ownerId, selectedOutletId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const createZone = useCallback(
    async (name: string) => {
      if (!ownerId || !selectedOutletId) return null;
      const { data, error } = await supabase
        .from("floor_plan_zones")
        .insert({
          user_id: ownerId,
          outlet_id: selectedOutletId,
          name,
          sort_order: zones.length,
        })
        .select("*")
        .single();
      if (error) {
        toast.error("Création zone", { description: error.message });
        return null;
      }
      setZones((prev) => [...prev, data as FloorPlanZone]);
      return data as FloorPlanZone;
    },
    [ownerId, selectedOutletId, zones.length]
  );

  const updateZone = useCallback(async (id: string, patch: Partial<FloorPlanZone>) => {
    setZones((prev) => prev.map((z) => (z.id === id ? { ...z, ...patch } : z)));
    const { error } = await supabase.from("floor_plan_zones").update(patch).eq("id", id);
    if (error) toast.error("Mise à jour zone", { description: error.message });
  }, []);

  const deleteZone = useCallback(async (id: string) => {
    setZones((prev) => prev.filter((z) => z.id !== id));
    setTables((prev) => prev.filter((t) => t.zone_id !== id));
    const { error } = await supabase.from("floor_plan_zones").delete().eq("id", id);
    if (error) toast.error("Suppression zone", { description: error.message });
  }, []);

  const createTable = useCallback(
    async (zoneId: string, payload: Partial<FloorPlanTable>) => {
      if (!ownerId || !selectedOutletId) return null;
      const insert = {
        user_id: ownerId,
        outlet_id: selectedOutletId,
        zone_id: zoneId,
        table_number: payload.table_number || String(tables.length + 1).padStart(2, "0"),
        shape: payload.shape || "rectangle",
        x: payload.x ?? 40,
        y: payload.y ?? 40,
        width: payload.width ?? (payload.shape === "bar" ? 160 : 80),
        height: payload.height ?? (payload.shape === "bar" ? 40 : 80),
        rotation: payload.rotation ?? 0,
        seats: payload.seats ?? 4,
        label: payload.label ?? null,
      };
      const { data, error } = await supabase
        .from("floor_plan_tables")
        .insert(insert)
        .select("*")
        .single();
      if (error) {
        toast.error("Ajout table", { description: error.message });
        return null;
      }
      setTables((prev) => [...prev, data as FloorPlanTable]);
      return data as FloorPlanTable;
    },
    [ownerId, selectedOutletId, tables.length]
  );

  const updateTable = useCallback(async (id: string, patch: Partial<FloorPlanTable>) => {
    setTables((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
    const { error } = await supabase.from("floor_plan_tables").update(patch).eq("id", id);
    if (error) toast.error("Mise à jour table", { description: error.message });
  }, []);

  const deleteTable = useCallback(async (id: string) => {
    setTables((prev) => prev.filter((t) => t.id !== id));
    const { error } = await supabase.from("floor_plan_tables").delete().eq("id", id);
    if (error) toast.error("Suppression table", { description: error.message });
  }, []);

  return {
    zones,
    tables,
    loading,
    refetch: fetchAll,
    createZone,
    updateZone,
    deleteZone,
    createTable,
    updateTable,
    deleteTable,
  };
};
