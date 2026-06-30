import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Image as ImageIcon, Layout, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { FloorPlanSnapshot } from "@/components/tables/FloorPlanSnapshot";
import { exportElementPDF, exportElementPNG } from "@/utils/snapshotExport";
import { useFloorPlan } from "@/hooks/useFloorPlan";

const SNAPSHOT_ID = "floor-plan-report-snapshot";

export const FloorPlanReportCard: React.FC = () => {
  const { zones, tables } = useFloorPlan();
  const [busy, setBusy] = useState<null | "pdf" | "png">(null);

  const handle = async (kind: "pdf" | "png") => {
    if (zones.length === 0) {
      toast.info("Aucun plan de salle configuré pour ce point de vente.");
      return;
    }
    setBusy(kind);
    try {
      const fname = `plan-de-salle-${new Date().toISOString().slice(0, 10)}.${kind}`;
      if (kind === "pdf") await exportElementPDF(SNAPSHOT_ID, fname, "landscape");
      else await exportElementPNG(SNAPSHOT_ID, fname);
      toast.success("Export réussi", { description: fname });
    } catch (e: any) {
      toast.error("Échec de l'export", { description: e?.message });
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layout className="h-5 w-5" /> Plan de salle
          </CardTitle>
          <CardDescription>
            Aperçu instantané de votre salle avec l'état actuel des tables. Fonctionne hors ligne.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-muted-foreground">
              {zones.length === 0
                ? "Aucun plan configuré."
                : `${tables.length} table(s) dans "${zones[0].name}".`}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handle("png")}
                disabled={busy !== null || zones.length === 0}
              >
                {busy === "png" ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <ImageIcon className="h-4 w-4 mr-2" />
                )}
                Image PNG
              </Button>
              <Button
                size="sm"
                onClick={() => handle("pdf")}
                disabled={busy !== null || zones.length === 0}
              >
                {busy === "pdf" ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Aperçu PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <FloorPlanSnapshot containerId={SNAPSHOT_ID} />
    </>
  );
};
