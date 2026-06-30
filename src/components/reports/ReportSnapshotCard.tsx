import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Image as ImageIcon, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { exportElementPDF, exportElementPNG } from "@/utils/snapshotExport";

interface ReportSnapshotCardProps {
  targetId: string;
  title?: string;
  description?: string;
  baseFilename?: string;
}

export const ReportSnapshotCard: React.FC<ReportSnapshotCardProps> = ({
  targetId,
  title = "Aperçu du rapport",
  description = "Génère une image ou un PDF de la vue actuelle du rapport. Fonctionne hors ligne.",
  baseFilename = "rapport",
}) => {
  const [busy, setBusy] = useState<null | "pdf" | "png">(null);

  const handle = async (kind: "pdf" | "png") => {
    const el = document.getElementById(targetId);
    if (!el) {
      toast.error("Rien à exporter pour le moment.");
      return;
    }
    setBusy(kind);
    try {
      const date = new Date().toISOString().slice(0, 10);
      const fname = `${baseFilename}-${date}.${kind}`;
      if (kind === "pdf") await exportElementPDF(targetId, fname, "portrait");
      else await exportElementPNG(targetId, fname);
      toast.success("Export réussi", { description: fname });
    } catch (e: any) {
      toast.error("Échec de l'export", { description: e?.message });
    } finally {
      setBusy(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" /> {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button size="sm" variant="outline" onClick={() => handle("png")} disabled={busy !== null}>
            {busy === "png" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ImageIcon className="h-4 w-4 mr-2" />}
            Image PNG
          </Button>
          <Button size="sm" onClick={() => handle("pdf")} disabled={busy !== null}>
            {busy === "pdf" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
            Aperçu PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
