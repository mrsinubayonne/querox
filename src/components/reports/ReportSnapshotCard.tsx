import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, Image as ImageIcon, FileText, Loader2, Eye } from "lucide-react";
import { toast } from "sonner";
import {
  exportElementPDF,
  exportElementPNG,
  previewElementPDF,
  previewElementPNG,
} from "@/utils/snapshotExport";

interface ReportSnapshotCardProps {
  targetId: string;
  title?: string;
  description?: string;
  baseFilename?: string;
}

export const ReportSnapshotCard: React.FC<ReportSnapshotCardProps> = ({
  targetId,
  title = "Aperçu du rapport",
  description = "Visualise instantanément un aperçu du rapport, puis exporte-le en image ou PDF. Fonctionne hors ligne.",
  baseFilename = "rapport",
}) => {
  const [busy, setBusy] = useState<null | "pdf" | "png" | "preview-pdf" | "preview-png">(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewKind, setPreviewKind] = useState<"pdf" | "png">("pdf");

  // Cleanup blob URL on unmount/change
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const ensureTarget = () => {
    const el = document.getElementById(targetId);
    if (!el) {
      toast.error("Rien à exporter pour le moment.");
      return null;
    }
    return el;
  };

  const handlePreview = async (kind: "pdf" | "png") => {
    if (!ensureTarget()) return;
    setBusy(kind === "pdf" ? "preview-pdf" : "preview-png");
    try {
      const url = kind === "pdf" ? await previewElementPDF(targetId, "portrait") : await previewElementPNG(targetId);
      setPreviewKind(kind);
      setPreviewUrl(url);
    } catch (e: any) {
      toast.error("Échec de l'aperçu", { description: e?.message });
    } finally {
      setBusy(null);
    }
  };

  const handleDownload = async (kind: "pdf" | "png") => {
    if (!ensureTarget()) return;
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

  const closePreview = () => {
    if (previewUrl && previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" /> {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button size="sm" variant="outline" onClick={() => handlePreview("png")} disabled={busy !== null}>
              {busy === "preview-png" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ImageIcon className="h-4 w-4 mr-2" />}
              Aperçu image
            </Button>
            <Button size="sm" onClick={() => handlePreview("pdf")} disabled={busy !== null}>
              {busy === "preview-pdf" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Eye className="h-4 w-4 mr-2" />}
              Aperçu PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!previewUrl} onOpenChange={(open) => { if (!open) closePreview(); }}>
        <DialogContent className="max-w-5xl w-[95vw] h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-4 py-3 border-b">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Aperçu {previewKind === "pdf" ? "PDF" : "image"} du rapport
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto bg-muted/40">
            {previewUrl && previewKind === "pdf" && (
              <iframe src={previewUrl} title="Aperçu PDF" className="w-full h-full border-0" />
            )}
            {previewUrl && previewKind === "png" && (
              <div className="p-4 flex justify-center">
                <img src={previewUrl} alt="Aperçu du rapport" className="max-w-full h-auto shadow-md rounded" />
              </div>
            )}
          </div>
          <div className="flex flex-wrap justify-end gap-2 p-3 border-t">
            <Button variant="outline" size="sm" onClick={closePreview}>Fermer</Button>
            <Button size="sm" variant="outline" onClick={() => handleDownload("png")} disabled={busy !== null}>
              {busy === "png" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ImageIcon className="h-4 w-4 mr-2" />}
              Télécharger PNG
            </Button>
            <Button size="sm" onClick={() => handleDownload("pdf")} disabled={busy !== null}>
              {busy === "pdf" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
              Télécharger PDF
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
