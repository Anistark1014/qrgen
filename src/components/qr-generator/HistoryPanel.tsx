import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QRHistoryItem, QRConfig } from "@/types/qr-types";
import { History, Trash2, Download, Upload, Clock, RotateCcw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { exportHistory, importHistory } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface HistoryPanelProps {
  history: QRHistoryItem[];
  onLoadFromHistory: (config: QRConfig) => void;
  onClearHistory: () => void;
}

export const HistoryPanel = ({ 
  history, 
  onLoadFromHistory, 
  onClearHistory 
}: HistoryPanelProps) => {
  const { toast } = useToast();
  const [isImporting, setIsImporting] = useState(false);

  const handleExportHistory = () => {
    try {
      exportHistory();
      toast({
        title: "History Exported",
        description: "Your QR code history has been exported to a JSON file.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Unable to export history. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleImportHistory = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      await importHistory(file);
      toast({
        title: "History Imported",
        description: "QR code history has been successfully imported.",
      });
      window.location.reload(); // Refresh to show imported history
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Unable to import history file. Please check the file format.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const getInputTypeLabel = (type: string) => {
    const labels = {
      url: "URL",
      text: "Text",
      email: "Email",
      phone: "Phone",
      sms: "SMS",
      wifi: "Wi-Fi",
      vcard: "vCard",
    };
    return labels[type as keyof typeof labels] || type;
  };

  const truncateData = (data: string, maxLength = 50) => {
    return data.length > maxLength ? `${data.substring(0, maxLength)}...` : data;
  };

  if (history.length === 0) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <History className="h-5 w-5" />
            <span>History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No QR codes in history yet.</p>
            <p className="text-sm">Generated QR codes will appear here.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <History className="h-5 w-5" />
            <span>History ({history.length}/10)</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportHistory}
              className="hover:bg-accent/10"
            >
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              asChild
              className="hover:bg-accent/10"
            >
              <label className="cursor-pointer">
                <Upload className="h-4 w-4 mr-1" />
                Import
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportHistory}
                  className="hidden"
                  disabled={isImporting}
                />
              </label>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onClearHistory}
              className="hover:bg-destructive/10 text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {history.map((item, index) => (
            <div
              key={index}
              className="flex items-center space-x-3 p-3 border border-border/50 rounded-lg hover:bg-accent/5 transition-colors"
            >
              {/* QR Thumbnail */}
              <img
                src={item.dataUrl}
                alt="QR Thumbnail"
                className="w-12 h-12 border border-border/50 rounded"
              />
              
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded font-medium">
                    {getInputTypeLabel(item.config.inputType)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm text-foreground truncate">
                  {truncateData(item.config.data)}
                </p>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                  <span>{item.config.size}px</span>
                  <span>•</span>
                  <span>{item.config.errorCorrectionLevel}</span>
                  {item.config.useGradient && (
                    <>
                      <span>•</span>
                      <span>Gradient</span>
                    </>
                  )}
                </div>
              </div>
              
              {/* Actions */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onLoadFromHistory(item.config)}
                className="hover:bg-accent/10"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Load
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};