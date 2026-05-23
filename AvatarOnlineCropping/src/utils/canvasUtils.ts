import { Shape, Template } from '@/store/editorStore';

export interface RenderOptions {
  image: HTMLImageElement;
  shape: Shape;
  zoom: number;
  offsetX: number;
  offsetY: number;
  canvasSize: number;
  template: Template | null;
}

export function renderAvatar(
  ctx: CanvasRenderingContext2D,
  options: RenderOptions
): void {
  const { image, shape, zoom, offsetX, offsetY, canvasSize, template } = options;
  
  ctx.clearRect(0, 0, canvasSize, canvasSize);
  
  ctx.save();
  
  if (shape === 'circle') {
    ctx.beginPath();
    ctx.arc(canvasSize / 2, canvasSize / 2, canvasSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
  }
  
  const imgAspect = image.width / image.height;
  const canvasAspect = 1;
  
  let drawWidth: number;
  let drawHeight: number;
  
  if (imgAspect > canvasAspect) {
    drawHeight = canvasSize * zoom;
    drawWidth = drawHeight * imgAspect;
  } else {
    drawWidth = canvasSize * zoom;
    drawHeight = drawWidth / imgAspect;
  }
  
  const drawX = (canvasSize - drawWidth) / 2 + offsetX;
  const drawY = (canvasSize - drawHeight) / 2 + offsetY;
  
  ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
  
  ctx.restore();
  
  if (template) {
    drawBorder(ctx, canvasSize, shape, template);
  }
}

function drawBorder(
  ctx: CanvasRenderingContext2D,
  canvasSize: number,
  shape: Shape,
  template: Template
): void {
  ctx.save();
  
  ctx.lineWidth = template.border_width;
  ctx.strokeStyle = template.border_color;
  
  if (shape === 'circle') {
    ctx.beginPath();
    ctx.arc(
      canvasSize / 2,
      canvasSize / 2,
      canvasSize / 2 - template.border_width / 2,
      0,
      Math.PI * 2
    );
    ctx.stroke();
  } else {
    ctx.strokeRect(
      template.border_width / 2,
      template.border_width / 2,
      canvasSize - template.border_width,
      canvasSize - template.border_width
    );
  }
  
  ctx.restore();
}

export function downloadCanvas(canvas: HTMLCanvasElement, filename: string): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

export function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
