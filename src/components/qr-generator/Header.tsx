import { Button } from "@/components/ui/button";
import { Moon, Sun, QrCode } from "lucide-react";

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: (darkMode: boolean) => void;
}

export const Header = ({ darkMode, onToggleDarkMode }: HeaderProps) => {
  return (
    <header className="flex items-center justify-between p-6 bg-card/50 backdrop-blur-sm border border-border rounded-xl shadow-tech">
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-tech-gradient rounded-lg shadow-glow animate-tech-glow">
          <QrCode className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-tech-gradient bg-clip-text text-transparent">
            Advanced QR Generator
          </h1>
          <p className="text-muted-foreground">
            Offline • Customizable • High-Resolution QR Creation Tool
          </p>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onToggleDarkMode(!darkMode)}
          className="hover:bg-accent/10 border-border/50"
        >
          {darkMode ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>
        

      </div>
    </header>
  );
};