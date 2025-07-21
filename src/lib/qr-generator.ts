import QRCode from "qrcode";
import { QRConfig } from "@/types/qr-types";

export const generateQRCode = async (config: QRConfig): Promise<string> => {
  const options: QRCode.QRCodeToDataURLOptions = {
    errorCorrectionLevel: config.errorCorrectionLevel,
    type: "image/png",
    quality: 1,
    margin: 2,
    width: config.size,
    color: {
      dark: config.useGradient ? "#000000" : config.foregroundColor,
      light: config.transparentBackground ? "#FFFFFF00" : config.backgroundColor,
    },
  };

  try {
    let dataUrl = await QRCode.toDataURL(config.data, options);

    // If gradient is enabled, we need to apply it manually
    if (config.useGradient) {
      dataUrl = await applyGradientToQR(dataUrl, config);
    }

    // Apply logo if present
    if (config.logo) {
      dataUrl = await applyLogoToQR(dataUrl, config);
    }

    // Apply label if present
    if (config.label) {
      dataUrl = await applyLabelToQR(dataUrl, config);
    }

    return dataUrl;
  } catch (error) {
    throw new Error(`QR Code generation failed: ${error}`);
  }
};

const applyGradientToQR = async (dataUrl: string, config: QRConfig): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      // Create gradient
      const gradient = config.gradientType === "linear"
        ? ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
        : ctx.createRadialGradient(
            canvas.width / 2, canvas.height / 2, 0,
            canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) / 2
          );

      gradient.addColorStop(0, config.gradientColors[0]);
      gradient.addColorStop(1, config.gradientColors[1]);

      // Draw original QR code
      ctx.drawImage(img, 0, 0);

      // Apply gradient only to dark pixels
      ctx.globalCompositeOperation = "source-in";
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Reset background if not transparent
      if (!config.transparentBackground) {
        ctx.globalCompositeOperation = "destination-over";
        ctx.fillStyle = config.backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      resolve(canvas.toDataURL("image/png"));
    };

    img.src = dataUrl;
  });
};

const applyLogoToQR = async (dataUrl: string, config: QRConfig): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const qrImg = new Image();

    qrImg.onload = () => {
      canvas.width = qrImg.width;
      canvas.height = qrImg.height;

      // Draw QR code
      ctx.drawImage(qrImg, 0, 0);

      if (config.logo) {
        const logoImg = new Image();
        logoImg.onload = () => {
          const logoSize = (canvas.width * config.logoSize) / 100;
          const x = (canvas.width - logoSize) / 2;
          const y = (canvas.height - logoSize) / 2;

          // Draw white background for logo
          ctx.fillStyle = "white";
          ctx.fillRect(x - 4, y - 4, logoSize + 8, logoSize + 8);

          // Draw logo
          ctx.drawImage(logoImg, x, y, logoSize, logoSize);

          resolve(canvas.toDataURL("image/png"));
        };

        const reader = new FileReader();
        reader.onload = (e) => {
          logoImg.src = e.target?.result as string;
        };
        reader.readAsDataURL(config.logo);
      } else {
        resolve(canvas.toDataURL("image/png"));
      }
    };

    qrImg.src = dataUrl;
  });
};

const applyLabelToQR = async (dataUrl: string, config: QRConfig): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const img = new Image();

    img.onload = () => {
      const padding = 40;
      const fontSize = Math.max(16, config.size / 25);
      
      canvas.width = img.width;
      canvas.height = img.height + padding + fontSize;

      // Draw background
      if (!config.transparentBackground) {
        ctx.fillStyle = config.backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Draw QR code
      ctx.drawImage(img, 0, 0);

      // Draw label
      ctx.fillStyle = config.foregroundColor;
      ctx.font = `${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(config.label, canvas.width / 2, img.height + padding);

      resolve(canvas.toDataURL("image/png"));
    };

    img.src = dataUrl;
  });
};