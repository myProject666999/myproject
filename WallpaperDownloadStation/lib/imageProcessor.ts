import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

export const GENERATED_SIZES = [
  { label: '3840x2160', width: 3840, height: 2160 },
  { label: '2560x1440', width: 2560, height: 1440 },
  { label: '1920x1080', width: 1920, height: 1080 },
  { label: '1366x768', width: 1366, height: 768 },
  { label: '1280x720', width: 1280, height: 720 },
];

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'wallpapers');

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export async function generateThumbnail(
  inputBuffer: Buffer,
  width: number = 400,
  height: number = 225
): Promise<Buffer> {
  return sharp(inputBuffer)
    .resize(width, height, { fit: 'cover', position: 'center' })
    .jpeg({ quality: 80 })
    .toBuffer();
}

export async function generateMultiSize(
  inputBuffer: Buffer,
  originalWidth: number,
  originalHeight: number,
  wallpaperId: number
): Promise<{ label: string; width: number; height: number; path: string; fileSize: number }[]> {
  const results: { label: string; width: number; height: number; path: string; fileSize: number }[] = [];
  const wallpaperDir = path.join(UPLOAD_DIR, String(wallpaperId));
  ensureDir(wallpaperDir);

  const aspectRatio = originalWidth / originalHeight;

  for (const size of GENERATED_SIZES) {
    let targetWidth = size.width;
    let targetHeight = size.height;

    const sizeRatio = targetWidth / targetHeight;
    if (Math.abs(aspectRatio - sizeRatio) > 0.1) {
      if (aspectRatio > sizeRatio) {
        targetHeight = Math.round(targetWidth / aspectRatio);
      } else {
        targetWidth = Math.round(targetHeight * aspectRatio);
      }
    }

    if (targetWidth > originalWidth) {
      targetWidth = originalWidth;
      targetHeight = originalHeight;
    }

    if (targetHeight > originalHeight) {
      targetHeight = originalHeight;
      targetWidth = Math.round(targetHeight * aspectRatio);
    }

    const fileName = `${wallpaperId}_${size.label}.jpg`;
    const filePath = path.join(wallpaperDir, fileName);

    const outputBuffer = await sharp(inputBuffer)
      .resize(targetWidth, targetHeight, { fit: 'cover' })
      .jpeg({ quality: 90 })
      .toBuffer();

    fs.writeFileSync(filePath, outputBuffer);

    results.push({
      label: size.label,
      width: targetWidth,
      height: targetHeight,
      path: `/wallpapers/${wallpaperId}/${fileName}`,
      fileSize: outputBuffer.length,
    });
  }

  return results;
}

export async function processRemoteImage(imageUrl: string): Promise<{
  buffer: Buffer;
  width: number;
  height: number;
  fileSize: number;
  format: string;
}> {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const metadata = await sharp(buffer).metadata();

  return {
    buffer,
    width: metadata.width || 1920,
    height: metadata.height || 1080,
    fileSize: buffer.length,
    format: metadata.format || 'jpg',
  };
}
