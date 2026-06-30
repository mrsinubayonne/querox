// Export générique d'un élément DOM en PNG ou PDF (100% client, compatible offline)

const captureCanvas = async (el: HTMLElement) => {
  const html2canvas = (await import("html2canvas")).default;
  return html2canvas(el, { scale: 2, backgroundColor: "#ffffff", useCORS: true, logging: false });
};

export const exportElementPNG = async (elementId: string, filename: string) => {
  const el = document.getElementById(elementId);
  if (!el) throw new Error("Élément introuvable");
  const canvas = await captureCanvas(el);
  await new Promise<void>((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) return resolve();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      resolve();
    }, "image/png");
  });
};

export const exportElementPDF = async (
  elementId: string,
  filename: string,
  orientation: "portrait" | "landscape" = "portrait"
) => {
  const el = document.getElementById(elementId);
  if (!el) throw new Error("Élément introuvable");
  const [canvas, jsPDFMod] = await Promise.all([captureCanvas(el), import("jspdf")]);
  const jsPDF = (jsPDFMod as any).jsPDF || (jsPDFMod as any).default;
  const pdf = new jsPDF({ orientation, unit: "mm", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 10;
  const maxW = pageW - margin * 2;
  const imgRatio = canvas.width / canvas.height;
  const w = maxW;
  const h = w / imgRatio;
  const imgData = canvas.toDataURL("image/png");

  // Pagination si l'image dépasse une page
  if (h <= pageH - margin * 2) {
    pdf.addImage(imgData, "PNG", margin, margin, w, h);
  } else {
    // Découpage vertical
    const pageContentH = pageH - margin * 2;
    const pxPerMm = canvas.width / w;
    const sliceHeightPx = pageContentH * pxPerMm;
    let y = 0;
    let first = true;
    while (y < canvas.height) {
      const sliceCanvas = document.createElement("canvas");
      sliceCanvas.width = canvas.width;
      sliceCanvas.height = Math.min(sliceHeightPx, canvas.height - y);
      const ctx = sliceCanvas.getContext("2d");
      if (!ctx) break;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
      ctx.drawImage(canvas, 0, -y);
      const sliceData = sliceCanvas.toDataURL("image/png");
      const sliceH = sliceCanvas.height / pxPerMm;
      if (!first) pdf.addPage();
      pdf.addImage(sliceData, "PNG", margin, margin, w, sliceH);
      first = false;
      y += sliceHeightPx;
    }
  }
  pdf.save(filename);
};
