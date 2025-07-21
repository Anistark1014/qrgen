export type QRInputType = "url" | "text" | "email" | "phone" | "sms" | "wifi" | "vcard";

export type QRStyle = "square" | "dots" | "rounded";

export type ExportFormat = "png" | "svg" | "pdf" | "eps";

export type GradientType = "linear" | "radial";

export interface QRConfig {
  inputType: QRInputType;
  data: string;
  style: QRStyle;
  foregroundColor: string;
  backgroundColor: string;
  transparentBackground: boolean;
  useGradient: boolean;
  gradientType: GradientType;
  gradientColors: [string, string];
  size: number;
  logo: File | null;
  logoSize: number;
  label: string;
  errorCorrectionLevel: "L" | "M" | "Q" | "H";
}

export interface QRHistoryItem {
  config: QRConfig;
  dataUrl: string;
  timestamp: number;
}

export interface WiFiConfig {
  ssid: string;
  password: string;
  security: "WPA" | "WEP" | "nopass";
  hidden: boolean;
}

export interface VCardConfig {
  name: string;
  phone: string;
  email: string;
  organization: string;
  jobTitle: string;
  website: string;
}