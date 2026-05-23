import QRCode from "qrcode";
import { createCanvas, loadImage } from "canvas";

export type ErrorLevel = "L" | "M" | "Q" | "H";
export type DotStyle = "square" | "rounded" | "dots";

export interface QRCodeOptions {
  content: string;
  qrColor: string;
  bgColor: string;
  errorLevel: ErrorLevel;
  dotStyle: DotStyle;
  margin: number;
  width: number;
  logoData?: string;
  logoSize?: number;
}

export async function generateQRCode(options: QRCodeOptions): Promise<string> {
  const {
    content,
    qrColor,
    bgColor,
    errorLevel,
    dotStyle,
    margin,
    width,
    logoData,
    logoSize = 0.2,
  } = options;

  const canvas = createCanvas(width, width);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, width);

  const qrCanvas = createCanvas(width, width);
  await QRCode.toCanvas(qrCanvas, content, {
    errorCorrectionLevel: errorLevel,
    margin: margin,
    width: width,
    color: {
      dark: qrColor,
      light: bgColor,
    },
  });

  if (dotStyle === "square") {
    ctx.drawImage(qrCanvas, 0, 0);
  } else {
    const qrCtx = qrCanvas.getContext("2d");
    const imageData = qrCtx.getImageData(0, 0, width, width);
    const data = imageData.data;

    const moduleSize = width / (25 + margin * 2);
    const offset = moduleSize * margin;

    for (let y = 0; y < 25; y++) {
      for (let x = 0; x < 25; x++) {
        const pixelX = Math.floor(offset + x * moduleSize + moduleSize / 2);
        const pixelY = Math.floor(offset + y * moduleSize + moduleSize / 2);
        const idx = (pixelY * width + pixelX) * 4;

        if (data[idx] === 0) {
          ctx.fillStyle = qrColor;
          const centerX = offset + x * moduleSize + moduleSize / 2;
          const centerY = offset + y * moduleSize + moduleSize / 2;
          const radius = dotStyle === "dots" ? moduleSize * 0.4 : moduleSize * 0.35;

          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }

  if (logoData && logoSize > 0) {
    try {
      const logo = await loadImage(logoData);
      const logoWidth = width * logoSize;
      const logoHeight = (logo.height / logo.width) * logoWidth;
      const logoX = (width - logoWidth) / 2;
      const logoY = (width - logoHeight) / 2;

      ctx.fillStyle = bgColor;
      const padding = logoWidth * 0.1;
      ctx.fillRect(
        logoX - padding,
        logoY - padding,
        logoWidth + padding * 2,
        logoHeight + padding * 2
      );

      ctx.drawImage(logo, logoX, logoY, logoWidth, logoHeight);
    } catch (error) {
      console.error("Failed to add logo:", error);
    }
  }

  return canvas.toDataURL("image/png");
}

export function downloadQRCode(dataUrl: string, filename: string = "qrcode.png"): void {
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
}
