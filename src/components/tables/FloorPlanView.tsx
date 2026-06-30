import React, { useEffect, useMemo, useRef, useState } from "react";
import { useOutlets } from "@/hooks/useOutlets";
import {
  useFloorPlan,
  FloorPlanShape,
  FloorPlanTable,
  FloorPlanZone,
} from "@/hooks/useFloorPlan";
import { TableSession } from "@/hooks/useOptimizedTableSessions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Pencil,
  Eye,
  Trash2,
  Square,
  Circle,
  RectangleHorizontal,
  Minus,
  RotateCw,
} from "lucide-react";
import { toast } from "sonner";

interface Props {
  sessions: TableSession[];
  onTableClick: (tableNumber: string, session: TableSession | null) => void;
  canManageTables: boolean;
}

const shapeIcon = (s: FloorPlanShape) => {
  switch (s) {
    case "round":
      return <Circle className="h-4 w-4" />;
    case "square":
      return <Square className="h-4 w-4" />;
    case "bar":
      return <Minus className="h-4 w-4" />;
    default:
      return <RectangleHorizontal className="h-4 w-4" />;
  }
};

const statusBg = (session: TableSession | null) => {
  if (!session) return "bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-300";
  if (session.status === "active") return "bg-red-500/15 border-red-500 text-red-700 dark:text-red-300";
  if (session.status === "closed") return "bg-amber-500/20 border-amber-500 text-amber-800 dark:text-amber-300";
  if (session.status === "paid") return "bg-blue-500/15 border-blue-500 text-blue-700 dark:text-blue-300";
  return "bg-muted border-border";
};

export const FloorPlanView: React.FC<Props> = ({ sessions, onTableClick, canManageTables }) => {
  const {
    zones,
    tables,
    loading,
    createZone,
    updateZone,
    deleteZone,
    createTable,
    updateTable,
    deleteTable,
  } = useFloorPlan();

  const [activeZoneId, setActiveZoneId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const activeZone: FloorPlanZone | undefined = useMemo(
    () => zones.find((z) => z.id === activeZoneId) ?? zones[0],
    [zones, activeZoneId]
  );

  const zoneTables = useMemo(
    () => (activeZone ? tables.filter((t) => t.zone_id === activeZone.id) : []),
    [tables, activeZone]
  );

  const sessionByNumber = useMemo(() => {
    const map = new Map<string, TableSession>();
    sessions.forEach((s) => {
      if (s.status === "active" || s.status === "closed" || s.status === "paid") {
        // active/closed prennent priorité sur paid pour une même table
        const existing = map.get(s.table_number);
        if (!existing || existing.status === "paid") {
          map.set(s.table_number, s);
        }
      }
    });
    return map;
  }, [sessions]);

  // Positions locales pendant le drag (pour ne pas écrire en base à chaque pixel)
  const [dragOverride, setDragOverride] = useState<{ id: string; x: number; y: number } | null>(null);

  const handleAddZone = async () => {
    const name = window.prompt("Nom de la salle (ex: Terrasse, VIP)", `Salle ${zones.length + 1}`);
    if (!name) return;
    const z = await createZone(name);
    if (z) setActiveZoneId(z.id);
  };

  const handleRenameZone = async () => {
    if (!activeZone) return;
    const name = window.prompt("Nouveau nom", activeZone.name);
    if (!name || name === activeZone.name) return;
    await updateZone(activeZone.id, { name });
  };

  const handleDeleteZone = async () => {
    if (!activeZone) return;
    if (!window.confirm(`Supprimer la salle "${activeZone.name}" et toutes ses tables ?`)) return;
    await deleteZone(activeZone.id);
    setActiveZoneId(null);
  };

  const handleAddTable = async (shape: FloorPlanShape) => {
    if (!activeZone) {
      toast.info("Créez d'abord une salle");
      return;
    }
    const existingNums = new Set(tables.map((t) => t.table_number));
    let n = 1;
    while (existingNums.has(String(n).padStart(2, "0"))) n++;
    await createTable(activeZone.id, {
      shape,
      table_number: String(n).padStart(2, "0"),
      x: 60,
      y: 60,
    });
  };

  // Drag handling
  const dragState = useRef<{
    id: string;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);

  const handlePointerDown = (e: React.PointerEvent, t: FloorPlanTable) => {
    if (!editMode) return;
    e.stopPropagation();
    setSelectedTableId(t.id);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragState.current = {
      id: t.id,
      startX: e.clientX,
      startY: e.clientY,
      origX: t.x,
      origY: t.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const d = dragState.current;
    if (!d || !canvasRef.current || !activeZone) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    const tbl = tables.find((t) => t.id === d.id);
    if (!tbl) return;
    const nx = Math.max(0, Math.min(activeZone.width - tbl.width, d.origX + dx));
    const ny = Math.max(0, Math.min(activeZone.height - tbl.height, d.origY + dy));
    // override local uniquement (pas d'écriture DB)
    setDragOverride({ id: d.id, x: Math.round(nx), y: Math.round(ny) });
  };

  const handlePointerUp = () => {
    const d = dragState.current;
    const override = dragOverride;
    if (d && override && override.id === d.id) {
      // Persiste une seule fois au relâchement
      if (override.x !== d.origX || override.y !== d.origY) {
        updateTable(d.id, { x: override.x, y: override.y });
      }
    }
    dragState.current = null;
    setDragOverride(null);
  };

  const handleTableTap = (t: FloorPlanTable) => {
    if (editMode) {
      setSelectedTableId(t.id);
      return;
    }
    const session = sessionByNumber.get(t.table_number) ?? null;
    onTableClick(t.table_number, session);
  };

  const selectedTable = tables.find((t) => t.id === selectedTableId) || null;

  if (loading) {
    return <div className="text-center text-muted-foreground py-12">Chargement du plan…</div>;
  }

  if (zones.length === 0) {
    return (
      <div className="text-center py-16 border-2 border-dashed rounded-xl">
        <p className="text-muted-foreground mb-4">Aucune salle créée pour ce point de vente.</p>
        {canManageTables && (
          <Button onClick={handleAddZone}>
            <Plus className="h-4 w-4 mr-2" />
            Créer ma première salle
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={activeZone?.id} onValueChange={setActiveZoneId}>
          <TabsList>
            {zones.map((z) => (
              <TabsTrigger key={z.id} value={z.id}>
                {z.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {canManageTables && (
          <div className="flex gap-2">
            <Button variant={editMode ? "default" : "outline"} size="sm" onClick={() => setEditMode((v) => !v)}>
              {editMode ? <Eye className="h-4 w-4 mr-2" /> : <Pencil className="h-4 w-4 mr-2" />}
              {editMode ? "Vue client" : "Modifier le plan"}
            </Button>

            {editMode && (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-2" /> Table
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleAddTable("rectangle")}>
                      <RectangleHorizontal className="h-4 w-4 mr-2" /> Rectangle
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleAddTable("round")}>
                      <Circle className="h-4 w-4 mr-2" /> Ronde
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleAddTable("square")}>
                      <Square className="h-4 w-4 mr-2" /> Carrée
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleAddTable("bar")}>
                      <Minus className="h-4 w-4 mr-2" /> Bar / banquette
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button size="sm" variant="outline" onClick={handleAddZone}>
                  <Plus className="h-4 w-4 mr-2" /> Salle
                </Button>
                <Button size="sm" variant="ghost" onClick={handleRenameZone}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={handleDeleteZone}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {editMode && selectedTable && (
        <div className="flex flex-wrap items-end gap-3 p-3 rounded-lg border bg-muted/30">
          <div>
            <Label className="text-xs">N°</Label>
            <Input
              className="h-8 w-24"
              value={selectedTable.table_number}
              onChange={(e) => updateTable(selectedTable.id, { table_number: e.target.value })}
            />
          </div>
          <div>
            <Label className="text-xs">Couverts</Label>
            <Input
              type="number"
              min={1}
              className="h-8 w-20"
              value={selectedTable.seats}
              onChange={(e) => updateTable(selectedTable.id, { seats: parseInt(e.target.value) || 1 })}
            />
          </div>
          <div>
            <Label className="text-xs">Largeur</Label>
            <Input
              type="number"
              min={40}
              className="h-8 w-20"
              value={selectedTable.width}
              onChange={(e) => updateTable(selectedTable.id, { width: parseInt(e.target.value) || 40 })}
            />
          </div>
          <div>
            <Label className="text-xs">Hauteur</Label>
            <Input
              type="number"
              min={40}
              className="h-8 w-20"
              value={selectedTable.height}
              onChange={(e) => updateTable(selectedTable.id, { height: parseInt(e.target.value) || 40 })}
            />
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              updateTable(selectedTable.id, { rotation: (selectedTable.rotation + 15) % 360 })
            }
          >
            <RotateCw className="h-4 w-4 mr-1" /> {selectedTable.rotation}°
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={async () => {
              if (window.confirm("Supprimer cette table du plan ?")) {
                await deleteTable(selectedTable.id);
                setSelectedTableId(null);
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}

      {activeZone && (
        <div className="overflow-auto rounded-xl border bg-muted/20">
          <div
            ref={canvasRef}
            className="relative"
            style={{
              width: activeZone.width,
              height: activeZone.height,
              backgroundImage:
                "linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onClick={() => setSelectedTableId(null)}
          >
            {zoneTables.map((t) => {
              const session = sessionByNumber.get(t.table_number) ?? null;
              const isRound = t.shape === "round";
              const selected = selectedTableId === t.id;
              const isDragging = dragOverride?.id === t.id;
              const renderX = isDragging ? dragOverride!.x : t.x;
              const renderY = isDragging ? dragOverride!.y : t.y;
              return (
                <div
                  key={t.id}
                  className={`absolute flex flex-col items-center justify-center border-2 select-none ${isDragging ? "" : "transition-shadow"} ${statusBg(session)} ${
                    editMode ? "cursor-move" : "cursor-pointer hover:shadow-lg"
                  } ${selected ? "ring-2 ring-primary ring-offset-2" : ""}`}
                  style={{
                    left: renderX,
                    top: renderY,
                    width: t.width,
                    height: t.height,
                    borderRadius: isRound ? "50%" : 10,
                    transform: `rotate(${t.rotation}deg)`,
                    touchAction: "none",
                  }}
                  onPointerDown={(e) => handlePointerDown(e, t)}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTableTap(t);
                  }}
                >
                  <div className="font-bold text-sm leading-none">{t.table_number}</div>
                  <div className="text-[10px] opacity-70 flex items-center gap-1 mt-0.5">
                    {shapeIcon(t.shape)} {t.seats}p
                  </div>
                  {session && (
                    <div className="text-[10px] font-medium mt-0.5">
                      {new Intl.NumberFormat("fr-FR").format(session.total_amount)} XOF
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500" /> Libre</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500" /> Occupée</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-500" /> En attente</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-500" /> Payée</span>
      </div>
    </div>
  );
};
