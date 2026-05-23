'use client';

import React from 'react';
import { WatermarkPosition } from '@/lib/watermark';

interface PositionPreviewProps {
  imageUrl: string;
  watermarkText: string;
  position: WatermarkPosition;
  opacity: number;
  fontSize: number;
  fontColor: string;
}

export default function PositionPreview({
  imageUrl,
  watermarkText,
  position,
  opacity,
  fontSize,
  fontColor,
}: PositionPreviewProps) {
  const positionStyles: Record<WatermarkPosition, React.CSSProperties> = {
    'top-left': { top: '5%', left: '5%' },
    'top-center': { top: '5%', left: '50%', transform: 'translateX(-50%)' },
    'top-right': { top: '5%', right: '5%' },
    'middle-left': { top: '50%', left: '5%', transform: 'translateY(-50%)' },
    'middle-center': { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
    'middle-right': { top: '50%', right: '5%', transform: 'translateY(-50%)' },
    'bottom-left': { bottom: '5%', left: '5%' },
    'bottom-center': { bottom: '5%', left: '50%', transform: 'translateX(-50%)' },
    'bottom-right': { bottom: '5%', right: '5%' },
  };

  return (
    <div className="relative inline-block">
      <div className="relative rounded-lg overflow-hidden bg-gray-100" style={{ maxWidth: '400px' }}>
        <img
          src={imageUrl}
          alt="预览"
          className="w-full h-auto"
        />
        {watermarkText && (
          <div
            className="absolute"
            style={{
              position: 'absolute',
              ...positionStyles[position],
              color: fontColor,
              fontSize: `${fontSize}px`,
              fontWeight: 'bold',
              opacity: opacity,
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
              pointerEvents: 'none',
            }}
          >
            {watermarkText}
          </div>
        )}
      </div>
    </div>
  );
}
