import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QRConfig } from "@/types/qr-types";
import { Eye, Save, Loader2, Copy, CheckCircle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface PreviewPanelProps {
  config: QRConfig;
  qrDataUrl: string;
  isGenerating: boolean;
  onSaveToHistory: () => void;
}

export const PreviewPanel = ({ 
  config, 
  qrDataUrl, 
  isGenerating, 
  onSaveToHistory 
}: PreviewPanelProps) => {
  const { toast } = useToast();
  const [isCopying, setIsCopying] = useState(false);

  const handleCopyToClipboard = async () => {
    if (!qrDataUrl) return;

    setIsCopying(true);
    try {
      // Convert data URL to blob
      const response = await fetch(qrDataUrl);
      const blob = await response.blob();
      
      // Copy to clipboard
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ]);
      
      toast({
        title: "Copied to Clipboard",
        description: "QR code image has been copied to your clipboard.",
      });
    } catch (error) {
      // Fallback for older browsers
      try {
        await navigator.clipboard.writeText(config.data);
        toast({
          title: "Text Copied",
          description: "QR code content has been copied as text.",
        });
      } catch (fallbackError) {
        toast({
          title: "Copy Failed",
          description: "Unable to copy to clipboard. Please try downloading instead.",
          variant: "destructive",
        });
      }
    } finally {
      setIsCopying(false);
    }
  };

  const getPreviewSize = () => {
    return Math.min(400, config.size);
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Eye className="h-5 w-5" />
          <span>Live Preview</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* QR Code Preview */}
          <div className="flex justify-center">
            <div 
              className="p-6 rounded-lg border border-border/50 bg-background/50"
              style={{ 
                background: config.transparentBackground 
                  ? "transparent" 
                  : config.backgroundColor 
              }}
            >
              {isGenerating ? (
                <div className="flex items-center justify-center" style={{ 
                  width: getPreviewSize(), 
                  height: getPreviewSize() 
                }}>
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="QR Code Preview"
                  className="max-w-full h-auto animate-float"
                  style={{ 
                    width: getPreviewSize(), 
                    height: "auto",
                    imageRendering: "pixelated" 
                  }}
                />
              ) : (
                <div 
                  className="flex items-center justify-center text-muted-foreground border-2 border-dashed border-muted rounded-lg"
                  style={{ 
                    width: getPreviewSize(), 
                    height: getPreviewSize() 
                  }}
                >
                  <div className="text-center">
                    <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Enter content to generate QR code</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Preview Actions */}
          {qrDataUrl && (
            <div className="flex flex-wrap gap-2 justify-center">
              {typeof window !== "undefined" && /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = qrDataUrl;
                    link.download = "qr-code.png";
                    link.click();
                  }}
                  className="hover:bg-accent/10"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Download QR
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyToClipboard}
                  disabled={isCopying}
                  className="hover:bg-accent/10"
                >
                  {isCopying ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Copy className="h-4 w-4 mr-2" />
                  )}
                  Copy to Clipboard
                </Button>
              )}
            </div>
          )}


          {/* QR Code Info */}
          {config.data && (
            <div className="text-sm space-y-2 p-4 bg-muted/20 rounded-lg">
              <div className="flex justify-between">
                <span className="font-medium">Content Type:</span>
                <span className="capitalize">{config.inputType}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Size:</span>
                <span>{config.size}×{config.size}px</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Error Correction:</span>
                <span>{config.errorCorrectionLevel}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Data Length:</span>
                <span>{config.data.length} characters</span>
              </div>
              {config.label && (
                <div className="flex justify-between">
                  <span className="font-medium">Label:</span>
                  <span className="truncate ml-2 text-right">{config.label}</span>
                </div>
              )}
            </div>
          )}

          {/* Privacy Notice */}
          <div className="text-xs text-muted-foreground text-center p-3 bg-muted/10 rounded-lg border border-border/30">
            <CheckCircle className="h-4 w-4 inline mr-1 text-green-500" />
            All QR code data is processed locally in your browser. 
            No information is sent to any server.
          </div>
        </div>
      </CardContent>
    </Card>
  );
};