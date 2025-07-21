import { QRConfig, ExportFormat } from "@/types/qr-types";
import jsPDF from "jspdf";

export const exportAsFormat = async (
  dataUrl: string, 
  config: QRConfig, 
  format: ExportFormat
): Promise<void> => {
  const filename = `qr-code-${Date.now()}`;

  switch (format) {
    case "png":
      downloadDataUrl(dataUrl, `${filename}.png`);
      break;
      
    case "svg":
      await exportAsSVG(dataUrl, config, `${filename}.svg`);
      break;
      
    case "pdf":
      await exportAsPDF(dataUrl, config, `${filename}.pdf`);
      break;
      
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
};

const downloadDataUrl = (dataUrl: string, filename: string): void => {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  link.click();
};

const exportAsSVG = async (dataUrl: string, config: QRConfig, filename: string): Promise<void> => {
  // Convert PNG to SVG by embedding the image
  const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${config.size}" height="${config.size}" xmlns="http://www.w3.org/2000/svg">
  <image width="${config.size}" height="${config.size}" href="${dataUrl}"/>
  ${config.label ? `<text x="${config.size / 2}" y="${config.size + 30}" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="${config.foregroundColor}">${config.label}</text>` : ""}
</svg>`;

  const blob = new Blob([svgContent], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  
  URL.revokeObjectURL(url);
};

const exportAsPDF = async (dataUrl: string, config: QRConfig, filename: string): Promise<void> => {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Calculate dimensions to fit on page
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - (margin * 2);
  const maxHeight = pageHeight - (margin * 3); // Extra space for title and label
  
  const qrSize = Math.min(maxWidth, maxHeight - 40); // Reserve space for text
  const x = (pageWidth - qrSize) / 2;
  const y = margin + 20;

  // Add title
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  pdf.text("QR Code", pageWidth / 2, margin, { align: "center" });

  // Add QR code image
  pdf.addImage(dataUrl, "PNG", x, y, qrSize, qrSize);

  // Add label if present
  if (config.label) {
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.text(config.label, pageWidth / 2, y + qrSize + 15, { 
      align: "center",
      maxWidth: maxWidth 
    });
  }

  // Add metadata
  pdf.setFontSize(8);
  pdf.setTextColor(100);
  const metaY = y + qrSize + (config.label ? 35 : 25);
  pdf.text(`Size: ${config.size}×${config.size}px`, margin, metaY);
  pdf.text(`Type: ${config.inputType.toUpperCase()}`, margin, metaY + 5);
  pdf.text(`Generated: ${new Date().toLocaleString()}`, margin, metaY + 10);
  pdf.text(`Error Correction: ${config.errorCorrectionLevel}`, margin, metaY + 15);

  pdf.save(filename);
};