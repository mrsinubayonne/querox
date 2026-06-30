// Export du plan de salle en PNG ou PDF (100% client, compatible offline)

export const exportFloorPlanPNG = async (elementId: string, filename = "plan-de-salle.png") => {
  const el = document.getElementById(elementId);
  if (!el) throw new Error("Plan introuvable");
  const html2canvas = (await import("html2canvas")).default;
  const canvas = await html2canvas(el, { scale: 2, backgroundColor: "#ffffff", useCORS: true, logging: false });
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, "image/png");
};

export const exportFloorPlanPDF = async (elementId: string, filename = "plan-de-salle.pdf") => {
  const el = document.getElementById(elementId);
  if (!el) throw new Error("Plan introuvable");
  const [{ default: html2canvas }, jsPDFMod] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);
  const canvas = await html2canvas(el, { scale: 2, backgroundColor: "#ffffff", useCORS: true, logging: false });
  const jsPDF = (jsPDFMod as any).jsPDF || (jsPDFMod as any).default;
  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 10;
  const maxW = pageW - margin * 2;
  const maxH = pageH - margin * 2;
  const imgRatio = canvas.width / canvas.height;
  let w = maxW;
  let h = w / imgRatio;
  if (h > maxH) {
    h = maxH;
    w = h * imgRatio;
  }
  const x = (pageW - w) / 2;
  const y = (pageH - h) / 2;
  pdf.addImage(canvas.toDataURL("image/png"), "PNG", x, y, w, h);
  pdf.save(filename);
};
