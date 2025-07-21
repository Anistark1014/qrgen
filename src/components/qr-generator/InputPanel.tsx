import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { QRConfig, QRInputType, QRStyle, WiFiConfig, VCardConfig } from "@/types/qr-types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Upload, Palette, Settings, Wifi, User, Phone, Mail, MessageSquare, Globe, FileText } from "lucide-react";

interface InputPanelProps {
  config: QRConfig;
  onConfigChange: (config: QRConfig) => void;
}

export const InputPanel = ({ config, onConfigChange }: InputPanelProps) => {
  const [wifiConfig, setWifiConfig] = useState<WiFiConfig>({
    ssid: "",
    password: "",
    security: "WPA",
    hidden: false,
  });

  const [vCardConfig, setVCardConfig] = useState<VCardConfig>({
    name: "",
    phone: "",
    email: "",
    organization: "",
    jobTitle: "",
    website: "",
  });

  const inputTypeOptions = [
    { value: "url", label: "URL / Website", icon: Globe },
    { value: "text", label: "Plain Text", icon: FileText },
    { value: "email", label: "Email", icon: Mail },
    { value: "phone", label: "Phone Number", icon: Phone },
    { value: "sms", label: "SMS Message", icon: MessageSquare },
    { value: "wifi", label: "Wi-Fi", icon: Wifi },
    { value: "vcard", label: "vCard", icon: User },
  ];

  const generateWiFiString = () => {
    return `WIFI:T:${wifiConfig.security};S:${wifiConfig.ssid};P:${wifiConfig.password};H:${wifiConfig.hidden};;`;
  };

  const generateVCardString = () => {
    return `BEGIN:VCARD
VERSION:3.0
FN:${vCardConfig.name}
TEL:${vCardConfig.phone}
EMAIL:${vCardConfig.email}
ORG:${vCardConfig.organization}
TITLE:${vCardConfig.jobTitle}
URL:${vCardConfig.website}
END:VCARD`;
  };

  const handleInputTypeChange = (type: QRInputType) => {
    let newData = "";
    
    if (type === "wifi") {
      newData = generateWiFiString();
    } else if (type === "vcard") {
      newData = generateVCardString();
    }

    onConfigChange({
      ...config,
      inputType: type,
      data: newData,
    });
  };

  const handleDataChange = (value: string) => {
    let processedValue = value;
    
    // Auto-add https:// for URLs
    if (config.inputType === "url" && value && !value.match(/^https?:\/\//)) {
      processedValue = `https://${value}`;
    }
    
    onConfigChange({ ...config, data: processedValue });
  };

  const updateWiFiConfig = (updates: Partial<WiFiConfig>) => {
    const newConfig = { ...wifiConfig, ...updates };
    setWifiConfig(newConfig);
    onConfigChange({
      ...config,
      data: `WIFI:T:${newConfig.security};S:${newConfig.ssid};P:${newConfig.password};H:${newConfig.hidden};;`,
    });
  };

  const updateVCardConfig = (updates: Partial<VCardConfig>) => {
    const newConfig = { ...vCardConfig, ...updates };
    setVCardConfig(newConfig);
    onConfigChange({
      ...config,
      data: `BEGIN:VCARD
VERSION:3.0
FN:${newConfig.name}
TEL:${newConfig.phone}
EMAIL:${newConfig.email}
ORG:${newConfig.organization}
TITLE:${newConfig.jobTitle}
URL:${newConfig.website}
END:VCARD`,
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === "image/png" || file.type === "image/jpeg")) {
      onConfigChange({ ...config, logo: file });
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>QR Code Content</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="input-type">Content Type</Label>
            <Select value={config.inputType} onValueChange={handleInputTypeChange}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {inputTypeOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center space-x-2">
                        <Icon className="h-4 w-4" />
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {config.inputType === "wifi" ? (
            <div className="space-y-3">
              <div>
                <Label htmlFor="wifi-ssid">Network Name (SSID)</Label>
                <Input
                  id="wifi-ssid"
                  value={wifiConfig.ssid}
                  onChange={(e) => updateWiFiConfig({ ssid: e.target.value })}
                  placeholder="MyWiFiNetwork"
                />
              </div>
              <div>
                <Label htmlFor="wifi-password">Password</Label>
                <Input
                  id="wifi-password"
                  type="password"
                  value={wifiConfig.password}
                  onChange={(e) => updateWiFiConfig({ password: e.target.value })}
                  placeholder="WiFi password"
                />
              </div>
              <div>
                <Label htmlFor="wifi-security">Security Type</Label>
                <Select 
                  value={wifiConfig.security} 
                  onValueChange={(value: "WPA" | "WEP" | "nopass") => updateWiFiConfig({ security: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WPA">WPA/WPA2</SelectItem>
                    <SelectItem value="WEP">WEP</SelectItem>
                    <SelectItem value="nopass">No Password</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : config.inputType === "vcard" ? (
            <div className="space-y-3">
              <div>
                <Label htmlFor="vcard-name">Full Name</Label>
                <Input
                  id="vcard-name"
                  value={vCardConfig.name}
                  onChange={(e) => updateVCardConfig({ name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <Label htmlFor="vcard-phone">Phone</Label>
                <Input
                  id="vcard-phone"
                  value={vCardConfig.phone}
                  onChange={(e) => updateVCardConfig({ phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div>
                <Label htmlFor="vcard-email">Email</Label>
                <Input
                  id="vcard-email"
                  type="email"
                  value={vCardConfig.email}
                  onChange={(e) => updateVCardConfig({ email: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <Label htmlFor="vcard-org">Organization</Label>
                <Input
                  id="vcard-org"
                  value={vCardConfig.organization}
                  onChange={(e) => updateVCardConfig({ organization: e.target.value })}
                  placeholder="Company Name"
                />
              </div>
              <div>
                <Label htmlFor="vcard-title">Job Title</Label>
                <Input
                  id="vcard-title"
                  value={vCardConfig.jobTitle}
                  onChange={(e) => updateVCardConfig({ jobTitle: e.target.value })}
                  placeholder="Software Engineer"
                />
              </div>
              <div>
                <Label htmlFor="vcard-website">Website</Label>
                <Input
                  id="vcard-website"
                  value={vCardConfig.website}
                  onChange={(e) => updateVCardConfig({ website: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>
            </div>
          ) : (
            <div>
              <Label htmlFor="qr-data">
                {config.inputType === "url" && "Website URL"}
                {config.inputType === "text" && "Text Content"}
                {config.inputType === "email" && "Email Address"}
                {config.inputType === "phone" && "Phone Number"}
                {config.inputType === "sms" && "SMS Message"}
              </Label>
              {config.inputType === "text" || config.inputType === "sms" ? (
                <Textarea
                  id="qr-data"
                  value={config.data}
                  onChange={(e) => handleDataChange(e.target.value)}
                  placeholder={
                    config.inputType === "text" 
                      ? "Enter your text content here..." 
                      : "Enter SMS message..."
                  }
                  className="mt-1 min-h-[100px]"
                />
              ) : (
                <Input
                  id="qr-data"
                  value={config.data}
                  onChange={(e) => handleDataChange(e.target.value)}
                  placeholder={
                    config.inputType === "url" ? "example.com" :
                    config.inputType === "email" ? "example@email.com" :
                    config.inputType === "phone" ? "+1 (555) 123-4567" :
                    "Enter content..."
                  }
                  type={config.inputType === "email" ? "email" : "text"}
                  className="mt-1"
                />
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customization Section */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Palette className="h-5 w-5" />
            <span>Styling & Customization</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="colors" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="colors">Colors</TabsTrigger>
              <TabsTrigger value="style">Style</TabsTrigger>
              <TabsTrigger value="logo">Logo</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="colors" className="space-y-4 mt-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={config.useGradient}
                  onCheckedChange={(checked) => onConfigChange({ ...config, useGradient: checked })}
                />
                <Label>Use Gradient</Label>
              </div>

              {config.useGradient ? (
                <div className="space-y-3">
                  <div>
                    <Label>Gradient Type</Label>
                    <Select
                      value={config.gradientType}
                      onValueChange={(value: "linear" | "radial") => 
                        onConfigChange({ ...config, gradientType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="linear">Linear</SelectItem>
                        <SelectItem value="radial">Radial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Start Color</Label>
                      <Input
                        type="color"
                        value={config.gradientColors[0]}
                        onChange={(e) => onConfigChange({
                          ...config,
                          gradientColors: [e.target.value, config.gradientColors[1]]
                        })}
                      />
                    </div>
                    <div>
                      <Label>End Color</Label>
                      <Input
                        type="color"
                        value={config.gradientColors[1]}
                        onChange={(e) => onConfigChange({
                          ...config,
                          gradientColors: [config.gradientColors[0], e.target.value]
                        })}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <Label>Foreground Color</Label>
                  <Input
                    type="color"
                    value={config.foregroundColor}
                    onChange={(e) => onConfigChange({ ...config, foregroundColor: e.target.value })}
                  />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Switch
                  checked={config.transparentBackground}
                  onCheckedChange={(checked) => onConfigChange({ ...config, transparentBackground: checked })}
                />
                <Label>Transparent Background</Label>
              </div>

              {!config.transparentBackground && (
                <div>
                  <Label>Background Color</Label>
                  <Input
                    type="color"
                    value={config.backgroundColor}
                    onChange={(e) => onConfigChange({ ...config, backgroundColor: e.target.value })}
                  />
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="style" className="space-y-4 mt-4">
              <div>
                <Label>Dot Style</Label>
                <Select
                  value={config.dotStyle}
                  onValueChange={(value: "square" | "circle" | "rounded") => 
                    onConfigChange({ ...config, dotStyle: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="square">Square</SelectItem>
                    <SelectItem value="circle">Circle</SelectItem>
                    <SelectItem value="rounded">Rounded</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Eye Style</Label>
                <Select
                  value={config.eyeStyle}
                  onValueChange={(value: "square" | "circle" | "rounded") => 
                    onConfigChange({ ...config, eyeStyle: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="square">Square</SelectItem>
                    <SelectItem value="circle">Circle</SelectItem>
                    <SelectItem value="rounded">Rounded</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Corner Radius: {config.cornerRadius}px</Label>
                <Slider
                  value={[config.cornerRadius]}
                  onValueChange={([value]) => onConfigChange({ ...config, cornerRadius: value })}
                  min={0}
                  max={20}
                  step={1}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Margin: {config.margin}px</Label>
                <Slider
                  value={[config.margin]}
                  onValueChange={([value]) => onConfigChange({ ...config, margin: value })}
                  min={0}
                  max={10}
                  step={1}
                  className="mt-2"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="logo" className="space-y-4 mt-4">
              <div>
                <Label htmlFor="logo-upload">Upload Logo (PNG/JPEG)</Label>
                <div className="mt-1">
                  <Button variant="outline" asChild>
                    <label htmlFor="logo-upload" className="cursor-pointer">
                      <Upload className="h-4 w-4 mr-2" />
                      Choose File
                    </label>
                  </Button>
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/png,image/jpeg"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </div>
                {config.logo && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Selected: {config.logo.name}
                  </p>
                )}
              </div>

              {config.logo && (
                <div>
                  <Label>Logo Size: {config.logoSize}%</Label>
                  <Slider
                    value={[config.logoSize]}
                    onValueChange={([value]) => onConfigChange({ ...config, logoSize: value })}
                    min={10}
                    max={50}
                    step={1}
                    className="mt-2"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="label">Label Text (Optional)</Label>
                <Input
                  id="label"
                  value={config.label}
                  onChange={(e) => onConfigChange({ ...config, label: e.target.value })}
                  placeholder="Add a label below the QR code"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-4 mt-4">
              <div>
                <Label>QR Style</Label>
                <Select
                  value={config.style}
                  onValueChange={(value: QRStyle) => onConfigChange({ ...config, style: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="square">Square</SelectItem>
                    <SelectItem value="dots">Dots</SelectItem>
                    <SelectItem value="rounded">Rounded</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Error Correction Level</Label>
                <Select
                  value={config.errorCorrectionLevel}
                  onValueChange={(value: "L" | "M" | "Q" | "H") => 
                    onConfigChange({ ...config, errorCorrectionLevel: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L">Low (7%)</SelectItem>
                    <SelectItem value="M">Medium (15%)</SelectItem>
                    <SelectItem value="Q">Quartile (25%)</SelectItem>
                    <SelectItem value="H">High (30%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Export Size: {config.size}px</Label>
                <Slider
                  value={[config.size]}
                  onValueChange={([value]) => onConfigChange({ ...config, size: value })}
                  min={256}
                  max={4096}
                  step={256}
                  className="mt-2"
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};