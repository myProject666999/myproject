import sharp from 'sharp';

export type WatermarkPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'middle-left'
  | 'middle-center'
  | 'middle-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export interface WatermarkConfig {
  type: 'text' | 'logo';
  text?: string;
  logoPath?: string;
  position: WatermarkPosition;
  opacity: number;
  fontSize?: number;
  fontColor?: string;
  margin?: number;
}

export interface ImageInfo {
  width: number;
  height: number;
}

function getWatermarkPosition(
  imageWidth: number,
  imageHeight: number,
  watermarkWidth: number,
  watermarkHeight: number,
  position: WatermarkPosition,
  margin: number = 20
): { left: number; top: number } {
  let left = 0;
  let top = 0;

  switch (position) {
    case 'top-left':
      left = margin;
      top = margin;
      break;
    case 'top-center':
      left = (imageWidth - watermarkWidth) / 2;
      top = margin;
      break;
    case 'top-right':
      left = imageWidth - watermarkWidth - margin;
      top = margin;
      break;
    case 'middle-left':
      left = margin;
      top = (imageHeight - watermarkHeight) / 2;
      break;
    case 'middle-center':
      left = (imageWidth - watermarkWidth) / 2;
      top = (imageHeight - watermarkHeight) / 2;
      break;
    case 'middle-right':
      left = imageWidth - watermarkWidth - margin;
      top = (imageHeight - watermarkHeight) / 2;
      break;
    case 'bottom-left':
      left = margin;
      top = imageHeight - watermarkHeight - margin;
      break;
    case 'bottom-center':
      left = (imageWidth - watermarkWidth) / 2;
      top = imageHeight - watermarkHeight - margin;
      break;
    case 'bottom-right':
      left = imageWidth - watermarkWidth - margin;
      top = imageHeight - watermarkHeight - margin;
      break;
  }

  return { left: Math.round(left), top: Math.round(top) };
}

async function createTextWatermark(
  text: string,
  fontSize: number = 24,
  fontColor: string = 'rgba(255, 255, 255, 0.8)'
): Promise<Buffer> {
  const textSVG = `
    <svg xmlns="http://www.w3.org/2000/svg" width="300" height="60">
      <text x="150" y="45" font-family="Arial, sans-serif" font-size="${fontSize}" 
            fill="${fontColor}" text-anchor="middle" font-weight="bold">
        ${text}
      </text>
    </svg>
  `;
  return Buffer.from(textSVG);
}

export async function addWatermark(
  imageBuffer: Buffer,
  config: WatermarkConfig
): Promise<Buffer> {
  const image = sharp(imageBuffer);
  const metadata = await image.metadata();
  const imageWidth = metadata.width || 800;
  const imageHeight = metadata.height || 600;

  let watermarkBuffer: Buffer;
  let watermarkWidth: number;
  let watermarkHeight: number;

  if (config.type === 'text' && config.text) {
    const fontSize = config.fontSize || Math.max(16, Math.round(imageWidth * 0.05));
    watermarkBuffer = await createTextWatermark(
      config.text,
      fontSize,
      config.fontColor || 'rgba(255, 255, 255, 0.8)'
    );

    const watermarkMetadata = await sharp(watermarkBuffer).metadata();
    watermarkWidth = watermarkMetadata.width || 300;
    watermarkHeight = watermarkMetadata.height || 60;
  } else if (config.type === 'logo' && config.logoPath) {
    watermarkBuffer = require('fs').readFileSync(config.logoPath);
    const logoImage = sharp(watermarkBuffer);
    const logoMetadata = await logoImage.metadata();
    watermarkWidth = logoMetadata.width || 100;
    watermarkHeight = logoMetadata.height || 100;

    const maxLogoWidth = Math.round(imageWidth * 0.2);
    if (watermarkWidth > maxLogoWidth) {
      const scale = maxLogoWidth / watermarkWidth;
      watermarkWidth = maxLogoWidth;
      watermarkHeight = Math.round(watermarkHeight * scale);
      watermarkBuffer = await logoImage
        .resize(watermarkWidth, watermarkHeight)
        .toBuffer();
    }
  } else {
    return imageBuffer;
  }

  const { left, top } = getWatermarkPosition(
    imageWidth,
    imageHeight,
    watermarkWidth,
    watermarkHeight,
    config.position,
    config.margin || 20
  );

  const result = await image
    .composite([
      {
        input: watermarkBuffer,
        left,
        top,
        blend: 'over',
        ...(config.type === 'logo' && { density: 72 }),
      },
    ])
    .webp({ quality: 90 })
    .toBuffer();

  return result;
}

export async function getImageInfo(imageBuffer: Buffer): Promise<ImageInfo> {
  const metadata = await sharp(imageBuffer).metadata();
  return {
    width: metadata.width || 0,
    height: metadata.height || 0,
  };
}
