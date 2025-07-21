import { useState, useEffect, useCallback } from "react";
import { Header } from "./qr-generator/Header";
import { InputPanel } from "./qr-generator/InputPanel";
import { PreviewPanel } from "./qr-generator/PreviewPanel";
import { ExportPanel } from "./qr-generator/ExportPanel";
// import { HistoryPanel } from "./qr-generator/HistoryPanel";
import { QRConfig, QRInputType, QRStyle, ExportFormat } from "@/types/qr-types";
import { generateQRCode } from "@/lib/qr-generator";
import { saveToHistory, getHistory, clearHistory } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

export const QRGeneratorApp = () => {
  const { toast } = useToast();
  const [darkMode, setDarkMode] = useState<boolean>(() => {
  const stored = localStorage.getItem("qr-generator-dark-mode");
  return stored === null ? true : stored === "true";
});
  
  const [config, setConfig] = useState<QRConfig>({
    inputType: "url",
    data: "",
    style: "square",
    foregroundColor: "#000000",
    backgroundColor: "#ffffff",
    transparentBackground: false,
    useGradient: false,
    gradientType: "linear",
    gradientColors: ["#3b82f6", "#8b5cf6"],
    size: 512,
    logo: null,
    logoSize: 20,
    label: "",
    errorCorrectionLevel: "M",
    margin: 2,
    cornerRadius: 0,
    dotStyle: "square",
    eyeStyle: "square"
  });

  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [history, setHistory] = useState(() => getHistory());
  const [isGenerating, setIsGenerating] = useState(false);

  // Apply dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("qr-generator-dark-mode", darkMode.toString());
  }, [darkMode]);

  // Generate QR code when config changes
  const generateQR = useCallback(async () => {
    if (!config.data.trim()) {
      setQrDataUrl("");
      return;
    }

    setIsGenerating(true);
    try {
      const dataUrl = await generateQRCode(config);
      setQrDataUrl(dataUrl);
    } catch (error) {
      console.error("QR generation failed:", error);
      toast({
        title: "Generation Failed",
        description: "Unable to generate QR code. Please check your input.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }, [config, toast]);

  useEffect(() => {
    const debounceTimer = setTimeout(generateQR, 300);
    return () => clearTimeout(debounceTimer);
  }, [generateQR]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "Enter":
            e.preventDefault();
            generateQR();
            break;
          case "d":
            e.preventDefault();
            if (qrDataUrl) {
              // Trigger download
              const link = document.createElement("a");
              link.href = qrDataUrl;
              link.download = `qr-code-${Date.now()}.png`;
              link.click();
            }
            break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyboard);
    return () => document.removeEventListener("keydown", handleKeyboard);
  }, [generateQR, qrDataUrl]);

  const handleSaveToHistory = () => {
    if (!config.data.trim() || !qrDataUrl) return;
    
    const newHistory = saveToHistory({
      config,
      dataUrl: qrDataUrl,
      timestamp: Date.now(),
    });
    setHistory(newHistory);
    
    toast({
      title: "Saved to History",
      description: "QR code has been saved to your local history.",
    });
  };

  const handleLoadFromHistory = (historyConfig: QRConfig) => {
    setConfig(historyConfig);
    toast({
      title: "Loaded from History",
      description: "Configuration restored from history.",
    });
  };

  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
    toast({
      title: "History Cleared",
      description: "All history has been cleared.",
    });
  };

  return (
  <div className="min-h-screen bg-surface-gradient text-foreground">
    <div className="w-full px-4 sm:px-6 lg:px-12 py-6 max-w-screen-xl mx-auto">
      <Header darkMode={darkMode} onToggleDarkMode={setDarkMode} />

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Left Panel - Input & Customization */}
        <div className="space-y-6">
          <InputPanel config={config} onConfigChange={setConfig} />
        </div>

        {/* Right Panel - Preview & Export */}
        <div className="space-y-6">
          <PreviewPanel 
            config={config}
            qrDataUrl={qrDataUrl}
            isGenerating={isGenerating}
            onSaveToHistory={handleSaveToHistory}
          />

          <ExportPanel 
            qrDataUrl={qrDataUrl}
            config={config}
            onExport={(format) => {
              toast({
                title: "Export Started",
                description: `Exporting as ${format.toUpperCase()}...`,
              });
            }}
          />
        </div>
      </div>
    </div>
  </div>
);



};