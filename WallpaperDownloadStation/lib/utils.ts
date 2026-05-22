import crypto from 'crypto';

export function generateUserIdentifier(ip: string, userAgent: string): string {
  const hash = crypto.createHash('md5');
  hash.update(`${ip}|${userAgent}`);
  return hash.digest('hex');
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatDate(date: string): string {
  const d = new Date(date);
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function buildImageUrl(originalUrl: string, width: number): string {
  if (originalUrl.includes('unsplash.com')) {
    return originalUrl.replace(/w=\d+/, `w=${width}`);
  }
  return originalUrl;
}

export function getAspectRatio(width: number, height: number): string {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(width, height);
  return `${width / divisor}:${height / divisor}`;
}

export function getClosestResolution(
  targetWidth: number,
  targetHeight: number,
  availableSizes: { width: number; height: number; resolution_label: string }[]
): { width: number; height: number; resolution_label: string } | null {
  if (availableSizes.length === 0) return null;

  let closest = availableSizes[0];
  let closestDiff = Math.abs(closest.width - targetWidth) + Math.abs(closest.height - targetHeight);

  for (const size of availableSizes) {
    const diff = Math.abs(size.width - targetWidth) + Math.abs(size.height - targetHeight);
    if (diff < closestDiff) {
      closestDiff = diff;
      closest = size;
    }
  }

  return closest;
}
