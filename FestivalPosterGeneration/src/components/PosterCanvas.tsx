"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { PosterTemplate, TextConfig, AvatarConfig, StickerConfig } from "@/lib/types";

interface PosterData {
  texts: Record<string, string>;
  avatarDataUrl: string | null;
}

interface Props {
  template: PosterTemplate;
  posterData: PosterData;
  onCanvasRef?: (canvas: HTMLCanvasElement) => void;
  scale?: number;
}

export default function PosterCanvas({
  template,
  posterData,
  onCanvasRef,
  scale = 1,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [avatarImage, setAvatarImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (posterData.avatarDataUrl) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => setAvatarImage(img);
      img.src = posterData.avatarDataUrl;
    } else {
      setAvatarImage(null);
    }
  }, [posterData.avatarDataUrl]);

  const drawBackground = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const { width, height, background_type, background_value } = template;

      if (background_type === "gradient") {
        const gradientMatch = background_value.match(
          /linear-gradient\((\d+)deg,\s*(.+)\s+0%,\s*(.+)\s+100%\)/
        );
        if (gradientMatch) {
          const angle = parseInt(gradientMatch[1]);
          const color1 = gradientMatch[2].trim();
          const color2 = gradientMatch[3].trim();

          const radians = (angle * Math.PI) / 180;
          const x = Math.cos(radians) * (width / 2) + width / 2;
          const y = Math.sin(radians) * (height / 2) + height / 2;
          const x2 = width - x;
          const y2 = height - y;

          const gradient = ctx.createLinearGradient(0, 0, 0, height);
          gradient.addColorStop(0, color1);
          gradient.addColorStop(1, color2);
          ctx.fillStyle = gradient;
        } else {
          ctx.fillStyle = background_value;
        }
      } else if (background_type === "color") {
        ctx.fillStyle = background_value;
      }

      ctx.fillRect(0, 0, width, height);
    },
    [template]
  );

  const drawText = useCallback(
    (ctx: CanvasRenderingContext2D, config: TextConfig, text: string) => {
      ctx.save();
      ctx.font = `bold ${config.fontSize}px ${config.fontFamily}`;
      ctx.fillStyle = config.color;
      ctx.textAlign = config.textAlign || "center";
      ctx.textBaseline = "middle";

      if (config.maxWidth) {
        const words = text.split("");
        let line = "";
        const lines: string[] = [];
        const lineHeight = config.fontSize * 1.2;

        for (let i = 0; i < words.length; i++) {
          const testLine = line + words[i];
          const metrics = ctx.measureText(testLine);
          if (metrics.width > config.maxWidth && line) {
            lines.push(line);
            line = words[i];
          } else {
            line = testLine;
          }
        }
        lines.push(line);

        const totalHeight = lines.length * lineHeight;
        lines.forEach((l, i) => {
          ctx.fillText(l, config.x, config.y - totalHeight / 2 + i * lineHeight + lineHeight / 2);
        });
      } else {
        ctx.fillText(text, config.x, config.y);
      }
      ctx.restore();
    },
    []
  );

  const drawAvatar = useCallback(
    (ctx: CanvasRenderingContext2D, config: AvatarConfig, img: HTMLImageElement | null) => {
      ctx.save();

      if (config.shape === "circle") {
        ctx.beginPath();
        ctx.arc(config.x, config.y, config.size / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        if (img) {
          const imgSize = config.size;
          const imgX = config.x - imgSize / 2;
          const imgY = config.y - imgSize / 2;
          ctx.drawImage(img, imgX, imgY, imgSize, imgSize);
        } else {
          ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
          ctx.fillRect(
            config.x - config.size / 2,
            config.y - config.size / 2,
            config.size,
            config.size
          );
        }

        ctx.beginPath();
        ctx.arc(config.x, config.y, config.size / 2, 0, Math.PI * 2);
        ctx.closePath();
      }

      if (config.borderWidth > 0) {
        ctx.strokeStyle = config.borderColor;
        ctx.lineWidth = config.borderWidth;
        if (config.shape === "circle") {
          ctx.beginPath();
          ctx.arc(config.x, config.y, config.size / 2, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          ctx.strokeRect(
            config.x - config.size / 2,
            config.y - config.size / 2,
            config.size,
            config.size
          );
        }
      }

      ctx.restore();
    },
    []
  );

  const drawSticker = useCallback(
    (ctx: CanvasRenderingContext2D, sticker: StickerConfig) => {
      ctx.save();
      ctx.font = `${sticker.size}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(sticker.value, sticker.x, sticker.y);
      ctx.restore();
    },
    []
  );

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = template.width;
    canvas.height = template.height;

    ctx.clearRect(0, 0, template.width, template.height);

    drawBackground(ctx);

    if (template.sticker_config) {
      template.sticker_config.forEach((sticker) => {
        drawSticker(ctx, sticker);
      });
    }

    if (template.avatar_config?.enabled) {
      drawAvatar(ctx, template.avatar_config, avatarImage);
    }

    if (template.text_config) {
      Object.entries(template.text_config).forEach(([key, config]) => {
        const text = posterData.texts[key] || config.text;
        drawText(ctx, config, text);
      });
    }

    if (onCanvasRef) {
      onCanvasRef(canvas);
    }
  }, [
    template,
    posterData,
    avatarImage,
    drawBackground,
    drawText,
    drawAvatar,
    drawSticker,
    onCanvasRef,
  ]);

  useEffect(() => {
    render();
  }, [render]);

  return (
    <canvas
      ref={canvasRef}
      className="rounded-xl shadow-2xl max-w-full h-auto"
      style={{
        width: `${template.width * scale}px`,
        height: `${template.height * scale}px`,
      }}
    />
  );
}
