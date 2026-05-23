import { ImageItem, Layout, LayoutSlot, PuzzleConfig, Rect } from '@/types';

export function createSlots(layout: Layout): LayoutSlot[] {
  return layout.slots.map((rect, index) => ({
    index,
    rect,
    image: null,
  }));
}

export function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
}

function calculateCoverRect(
  imageWidth: number,
  imageHeight: number,
  slotRect: Rect,
  canvasWidth: number,
  canvasHeight: number
): { sx: number; sy: number; sw: number; sh: number; dx: number; dy: number; dw: number; dh: number } {
  const slotPixelX = slotRect.x * canvasWidth;
  const slotPixelY = slotRect.y * canvasHeight;
  const slotPixelWidth = slotRect.width * canvasWidth;
  const slotPixelHeight = slotRect.height * canvasHeight;

  const imageAspect = imageWidth / imageHeight;
  const slotAspect = slotPixelWidth / slotPixelHeight;

  let sx = 0, sy = 0, sw = imageWidth, sh = imageHeight;

  if (imageAspect > slotAspect) {
    sw = imageHeight * slotAspect;
    sx = (imageWidth - sw) / 2;
  } else {
    sh = imageWidth / slotAspect;
    sy = (imageHeight - sh) / 2;
  }

  return {
    sx, sy, sw, sh,
    dx: slotPixelX,
    dy: slotPixelY,
    dw: slotPixelWidth,
    dh: slotPixelHeight,
  };
}

export async function renderPuzzle(
  canvas: HTMLCanvasElement,
  slots: LayoutSlot[],
  config: PuzzleConfig
): Promise<void> {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('无法获取 Canvas 上下文');

  const { canvasWidth, canvasHeight, backgroundColor, gap, borderWidth, borderColor, text } = config;

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  for (const slot of slots) {
    if (slot.image) {
      const img = await loadImage(slot.image.dataUrl);

      const slotPixelX = slot.rect.x * canvasWidth + gap / 2;
      const slotPixelY = slot.rect.y * canvasHeight + gap / 2;
      const slotPixelWidth = slot.rect.width * canvasWidth - gap;
      const slotPixelHeight = slot.rect.height * canvasHeight - gap;

      const imageAspect = img.width / img.height;
      const slotAspect = slotPixelWidth / slotPixelHeight;

      let sx = 0, sy = 0, sw = img.width, sh = img.height;

      if (imageAspect > slotAspect) {
        sw = img.height * slotAspect;
        sx = (img.width - sw) / 2;
      } else {
        sh = img.width / slotAspect;
        sy = (img.height - sh) / 2;
      }

      ctx.save();
      ctx.beginPath();
      ctx.rect(slotPixelX, slotPixelY, slotPixelWidth, slotPixelHeight);
      ctx.clip();

      ctx.drawImage(img, sx, sy, sw, sh, slotPixelX, slotPixelY, slotPixelWidth, slotPixelHeight);
      ctx.restore();

      if (borderWidth > 0) {
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = borderWidth;
        ctx.strokeRect(slotPixelX, slotPixelY, slotPixelWidth, slotPixelHeight);
      }
    } else {
      const slotPixelX = slot.rect.x * canvasWidth + gap / 2;
      const slotPixelY = slot.rect.y * canvasHeight + gap / 2;
      const slotPixelWidth = slot.rect.width * canvasWidth - gap;
      const slotPixelHeight = slot.rect.height * canvasHeight - gap;

      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(slotPixelX, slotPixelY, slotPixelWidth, slotPixelHeight);

      ctx.strokeStyle = '#d1d5db';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(slotPixelX, slotPixelY, slotPixelWidth, slotPixelHeight);
      ctx.setLineDash([]);
    }
  }

  if (text.content.trim()) {
    ctx.fillStyle = text.color;
    ctx.font = `${text.fontSize}px ${text.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text.content, text.position.x * canvasWidth, text.position.y * canvasHeight);
  }
}

export function downloadCanvas(canvas: HTMLCanvasElement, filename: string = 'puzzle.png'): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function createImageItem(file: File): Promise<ImageItem> {
  const dataUrl = await fileToDataUrl(file);
  const img = await loadImage(dataUrl);

  return {
    id: generateId(),
    dataUrl,
    width: img.width,
    height: img.height,
    name: file.name,
  };
}
