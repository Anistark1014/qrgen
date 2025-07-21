import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QRConfig, ExportFormat } from "@/types/qr-types";
import { Download, FileImage, FileType, FileSpreadsheet, Package } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { exportAsFormat } from "@/lib/export-utils";

interface ExportPanelProps {
  qrDataUrl: string;
  config: QRConfig;
  onExport: (format: ExportFormat) => void;
}

export const ExportPanel = ({ qrDataUrl, config, onExport }: ExportPanelProps) => {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const exportFormats = [
    { 
      format: "png" as ExportFormat, 
      label: "PNG Image", 
      icon: FileImage,
      description: "High-quality raster image" 
    },
    { 
      format: "svg" as ExportFormat, 
      label: "SVG Vector", 
      icon: FileType,
      description: "Scalable vector format" 
    },
    { 
      format: "pdf" as ExportFormat, 
      label: "PDF Document", 
      icon: FileSpreadsheet,
      description: "Print-ready document" 
    },
  ];

  const handleExport = async (format: ExportFormat) => {
    if (!qrDataUrl) {
      toast({
        title: "No QR Code",
        description: "Please generate a QR code first.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(format);
    try {
      await exportAsFormat(qrDataUrl, config, format);
      onExport(format);
      toast({
        title: "Export Successful",
        description: `QR code exported as ${format.toUpperCase()}.`,
      });
    } catch (error) {
      console.error("Export failed:", error);
      toast({
        title: "Export Failed",
        description: "Unable to export QR code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(null);
    }
  };

  const handleQuickDownload = () => {
    if (!qrDataUrl) return;
    
    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = `qr-code-${Date.now()}.png`;
    link.click();
    
    toast({
      title: "Download Started",
      description: "QR code is being downloaded as PNG.",
    });
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Download className="h-5 w-5" />
          <span>Export & Download</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Download */}
        <Button
          onClick={handleQuickDownload}
          disabled={!qrDataUrl}
          className="w-full bg-tech-gradient hover:opacity-90 text-white shadow-tech"
          size="lg"
        >
          <Download className="h-4 w-4 mr-2" />
          Quick Download PNG
        </Button>

        {/* Export Formats */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Export Formats</h4>
          <div className="grid gap-2">
            {exportFormats.map(({ format, label, icon: Icon, description }) => (
              <Button
                key={format}
                variant="outline"
                onClick={() => handleExport(format)}
                disabled={!qrDataUrl || isExporting === format}
                className="justify-start h-auto p-3 hover:bg-accent/10"
              >
                <div className="flex items-center space-x-3 w-full">
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <div className="text-left flex-1">
                    <div className="font-medium">{label}</div>
                    <div className="text-xs text-muted-foreground">{description}</div>
                  </div>
                  {isExporting === format && (
                    <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Batch Export (Coming Soon) */}
        <div className="p-3 bg-muted/10 rounded-lg border border-border/30">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Package className="h-4 w-4" />
            <span>Batch processing and CSV import coming soon...</span>
          </div>
        </div>

        {/* Export Settings */}
        <div className="text-xs space-y-1 text-muted-foreground">
          <div className="flex justify-between">
            <span>Current Size:</span>
            <span>{config.size}×{config.size}px</span>
          </div>
          <div className="flex justify-between">
            <span>Quality:</span>
            <span>Maximum</span>
          </div>
          <div className="flex justify-between">
            <span>Background:</span>
            <span>{config.transparentBackground ? "Transparent" : "Solid"}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};